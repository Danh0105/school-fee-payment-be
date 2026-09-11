"use client";

import { useQuery } from "@tanstack/react-query";
import type { PaginationParams } from "@/lib/types";
import { queryKeys } from "@/lib/query-keys";
import { paymentTransactionsApi } from "./api";
export const usePaymentTransactions = (params: PaginationParams = {}) =>
  useQuery({
    queryKey: [...queryKeys.transactions, params],
    queryFn: () => paymentTransactionsApi.list(params),
    placeholderData: (previous) => previous,
  });
export const usePaymentTransaction = (id: string) =>
  useQuery({
    queryKey: [...queryKeys.transactions, id],
    queryFn: () => paymentTransactionsApi.detail(id),
    enabled: Boolean(id),
  });
