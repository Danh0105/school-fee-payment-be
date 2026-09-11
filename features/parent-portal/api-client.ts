import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { ApiError } from "@/lib/error-messages";
import { useParentSessionStore } from "@/stores/parent-session-store";

interface ApiErrorEnvelope {
  success: false;
  error: { code?: string; message?: string; details?: unknown };
}

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3010";

const parentApiClient = axios.create({
  baseURL,
  timeout: 20_000,
  headers: { "Content-Type": "application/json" },
});

parentApiClient.interceptors.request.use((config) => {
  const token = useParentSessionStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

parentApiClient.interceptors.response.use(
  (response) => {
    const payload = response.data as { success?: boolean; data?: unknown };
    return payload?.success === true ? payload.data : response.data;
  },
  (rawError: AxiosError<ApiErrorEnvelope>) => {
    const payload = rawError.response?.data;
    const status = rawError.response?.status;
    const code =
      payload?.error?.code ??
      (status === 401 ? "UNAUTHORIZED" : "INTERNAL_ERROR");
    const message =
      payload?.error?.message ?? rawError.message ?? "Đã xảy ra lỗi";

    if (status === 401 || code === "FORBIDDEN") {
      useParentSessionStore.getState().clearSession();
      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/parent"
      ) {
        window.location.replace("/parent");
      }
    }

    throw new ApiError(code, message, status, payload?.error?.details);
  },
);

export async function parentApiRequest<T>(
  config: AxiosRequestConfig,
): Promise<T> {
  const response = await parentApiClient.request<T>(config);
  return response as unknown as T;
}
