"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error-messages";
import { useAuthStore } from "@/stores/auth-store";
import * as api from "./api";

export function useLogin() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  return useMutation({
    mutationFn: api.login,
    onSuccess: (session) => {
      setSession(session);
      toast.success(`Chào mừng ${session.user.fullName}`);
      router.replace("/");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((state) => state.clearSession);
  return useMutation({
    mutationFn: api.logout,
    onSettled: () => {
      clearSession();
      queryClient.clear();
      router.replace("/login");
    },
  });
}
