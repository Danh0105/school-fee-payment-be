"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { paymentOrdersApi } from "./api";
export const usePaymentOrder = (id: string) =>
  useQuery({
    queryKey: [...queryKeys.paymentOrders, id],
    queryFn: () => paymentOrdersApi.detail(id),
    enabled: Boolean(id),
    refetchInterval: (query) =>
      query.state.data?.status === "PENDING" ? 4_000 : false,
  });
export const usePaymentOrderQr = (id: string) =>
  useQuery({
    queryKey: [...queryKeys.paymentOrders, id, "qr"],
    queryFn: () => paymentOrdersApi.qr(id),
    enabled: Boolean(id),
    refetchInterval: (query) =>
      query.state.data?.status === "PENDING" ? 4_000 : false,
  });
