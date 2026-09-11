import { apiRequest } from "@/lib/api-client";
import { compactParams } from "@/lib/utils";
import type { AuditLog, PaginatedResult, PaginationParams } from "@/lib/types";
export interface AuditParams extends PaginationParams {
  entityType?: string;
  entityId?: string;
  userId?: string;
}
export const auditLogsApi = {
  list: (params: AuditParams = {}) =>
    apiRequest<PaginatedResult<AuditLog>>({
      method: "GET",
      url: "/audit-logs",
      params: compactParams(params),
    }),
};
