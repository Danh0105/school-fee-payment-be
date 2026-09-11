"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useParentSessionStore } from "@/stores/parent-session-store";
import { parentPortalApi } from "./api";

export function useParentSchools() {
  return useQuery({
    queryKey: [...queryKeys.parentPortal, "schools"],
    queryFn: parentPortalApi.schools,
    staleTime: 5 * 60_000,
  });
}

export function useParentMe() {
  const hasToken = useParentSessionStore((state) => Boolean(state.accessToken));
  return useQuery({
    queryKey: [...queryKeys.parentPortal, "me"],
    queryFn: parentPortalApi.me,
    enabled: hasToken,
  });
}

export function useParentReceivables() {
  const hasToken = useParentSessionStore((state) => Boolean(state.accessToken));
  return useQuery({
    queryKey: [...queryKeys.parentPortal, "receivables"],
    queryFn: parentPortalApi.receivables,
    enabled: hasToken,
  });
}

export function useParentPaymentOrder(id: string) {
  const hasToken = useParentSessionStore((state) => Boolean(state.accessToken));
  return useQuery({
    queryKey: [...queryKeys.parentPortal, "payment-orders", id],
    queryFn: () => parentPortalApi.paymentOrder(id),
    enabled: Boolean(id && hasToken),
    refetchInterval: (query) =>
      query.state.data?.status === "PENDING" ? 4_000 : false,
  });
}

export function useParentPaymentOrderQr(id: string) {
  const hasToken = useParentSessionStore((state) => Boolean(state.accessToken));
  return useQuery({
    queryKey: [...queryKeys.parentPortal, "payment-orders", id, "qr"],
    queryFn: () => parentPortalApi.paymentOrderQr(id),
    enabled: Boolean(id && hasToken),
    refetchInterval: (query) =>
      query.state.data?.status === "PENDING" ? 4_000 : false,
  });
}
