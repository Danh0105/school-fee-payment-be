"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AuthTokens, AuthUser, LoginResponse } from "@/lib/types";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  hydrated: boolean;
  setSession: (session: LoginResponse) => void;
  setTokens: (tokens: AuthTokens) => void;
  clearSession: () => void;
  setHydrated: (hydrated: boolean) => void;
}

function setSessionCookie(active: boolean) {
  if (typeof document === "undefined") return;
  document.cookie = active
    ? "school_fee_session=1; Path=/; Max-Age=2592000; SameSite=Lax"
    : "school_fee_session=; Path=/; Max-Age=0; SameSite=Lax";
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      hydrated: false,
      setSession: (session) => {
        setSessionCookie(true);
        set({
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          user: session.user,
        });
      },
      setTokens: (tokens) =>
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        }),
      clearSession: () => {
        setSessionCookie(false);
        set({ accessToken: null, refreshToken: null, user: null });
      },
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: "school-fee-auth",
      storage: createJSONStorage(() => window.localStorage),
      partialize: ({ accessToken, refreshToken, user }) => ({
        accessToken,
        refreshToken,
        user,
      }),
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
    },
  ),
);
