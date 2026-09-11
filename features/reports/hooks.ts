"use client";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { reportsApi, type ReportParams } from "./api";
export const useReceivablesReport = (
  params: ReportParams = {},
  enabled = true,
) =>
  useQuery({
    queryKey: [...queryKeys.reports, "receivables", params],
    queryFn: () => reportsApi.receivables(params),
    placeholderData: (previous) => previous,
    enabled,
  });
export const useClassReport = (id: string) =>
  useQuery({
    queryKey: [...queryKeys.reports, "class", id],
    queryFn: () => reportsApi.class(id),
    enabled: Boolean(id),
  });
