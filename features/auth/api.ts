import { apiRequest } from "@/lib/api-client";
import type { AuthTokens, LoginResponse } from "@/lib/types";

export function login(payload: { email: string; password: string }) {
  return apiRequest<LoginResponse>({
    method: "POST",
    url: "/auth/login",
    data: payload,
  });
}

export function refresh(refreshToken: string) {
  return apiRequest<AuthTokens>({
    method: "POST",
    url: "/auth/refresh",
    data: { refreshToken },
  });
}

export function logout() {
  return apiRequest<{ loggedOut: true }>({
    method: "POST",
    url: "/auth/logout",
  });
}
