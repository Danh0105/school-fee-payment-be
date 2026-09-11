"use client";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { auditLogsApi, type AuditParams } from "./api";
export const useAuditLogs = (params: AuditParams = {}) =>
  useQuery({
    queryKey: [...queryKeys.auditLogs, params],
    queryFn: () => auditLogsApi.list(params),
    placeholderData: (previous) => previous,
  });
