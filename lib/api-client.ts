import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { ApiError } from "@/lib/error-messages";
import type { AuthTokens } from "@/lib/types";
import { useAuthStore } from "@/stores/auth-store";

interface ApiErrorEnvelope {
  success: false;
  error: { code?: string; message?: string; details?: unknown };
}

interface RetriableConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3010";

export const apiClient = axios.create({
  baseURL,
  timeout: 20_000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

let refreshRequest: Promise<AuthTokens> | null = null;

/** A `responseType: "blob"` request gets its JSON error envelope as a Blob. */
async function readErrorEnvelope(
  data: unknown,
): Promise<ApiErrorEnvelope | undefined> {
  if (typeof Blob === "undefined" || !(data instanceof Blob))
    return data as ApiErrorEnvelope | undefined;
  try {
    return JSON.parse(await data.text()) as ApiErrorEnvelope;
  } catch {
    return undefined;
  }
}

apiClient.interceptors.response.use(
  (response) => {
    if (response.config.responseType === "blob") return response;
    const payload = response.data as { success?: boolean; data?: unknown };
    return payload?.success === true ? payload.data : response.data;
  },
  async (rawError: AxiosError<ApiErrorEnvelope>) => {
    const config = rawError.config as RetriableConfig | undefined;
    const isUnauthorized = rawError.response?.status === 401;
    const isRefresh = config?.url?.includes("/auth/refresh");
    const { refreshToken, setTokens, clearSession } = useAuthStore.getState();

    if (
      isUnauthorized &&
      config &&
      !config._retry &&
      !isRefresh &&
      refreshToken
    ) {
      config._retry = true;
      try {
        refreshRequest ??= axios
          .post<{ success: true; data: AuthTokens }>(
            `${baseURL}/auth/refresh`,
            { refreshToken },
          )
          .then((response) => response.data.data)
          .finally(() => {
            refreshRequest = null;
          });
        const tokens = await refreshRequest;
        setTokens(tokens);
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${tokens.accessToken}`,
        };
        return apiClient(config);
      } catch {
        clearSession();
        if (typeof window !== "undefined") window.location.replace("/login");
      }
    }

    const payload = await readErrorEnvelope(rawError.response?.data);
    const code =
      payload?.error?.code ??
      (isUnauthorized ? "UNAUTHORIZED" : "INTERNAL_ERROR");
    const message =
      payload?.error?.message ?? rawError.message ?? "Đã xảy ra lỗi";
    throw new ApiError(
      code,
      message,
      rawError.response?.status,
      payload?.error?.details,
    );
  },
);

export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.request<T>(config);
  return response as unknown as T;
}

export async function downloadFile(
  path: string,
  filename: string,
): Promise<void> {
  const response = await apiClient.get(path, { responseType: "blob" });
  const url = URL.createObjectURL(response.data as Blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
