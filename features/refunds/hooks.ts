"use client";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { PaginationParams } from "@/lib/types";
import { refundsApi } from "./api";
export const useRefunds = (params: PaginationParams = {}) =>
  useQuery({
    queryKey: [...queryKeys.refunds, params],
    queryFn: () => refundsApi.list(params),
    placeholderData: (previous) => previous,
  });
