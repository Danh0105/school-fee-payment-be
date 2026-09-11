"use client";
import { useQuery } from "@tanstack/react-query";
import type { PaginationParams } from "@/lib/types";
import { queryKeys } from "@/lib/query-keys";
import { reconciliationApi } from "./api";
export const useUnmatched = (params: PaginationParams = {}) =>
  useQuery({
    queryKey: [...queryKeys.reconciliation, "unmatched", params],
    queryFn: () => reconciliationApi.unmatched(params),
    placeholderData: (previous) => previous,
  });
