"use client";
import { useQuery } from "@tanstack/react-query";
import type { PaginationParams } from "@/lib/types";
import { queryKeys } from "@/lib/query-keys";
import { receiptsApi } from "./api";
export const useReceipts = (params: PaginationParams = {}) =>
  useQuery({
    queryKey: [...queryKeys.receipts, params],
    queryFn: () => receiptsApi.list(params),
    placeholderData: (previous) => previous,
  });
export const useReceipt = (id: string) =>
  useQuery({
    queryKey: [...queryKeys.receipts, id],
    queryFn: () => receiptsApi.detail(id),
    enabled: Boolean(id),
  });
