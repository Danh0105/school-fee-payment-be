import { apiRequest } from "@/lib/api-client";
import { compactParams } from "@/lib/utils";
import type {
  PaginatedResult,
  PaginationParams,
  Reconciliation,
} from "@/lib/types";
export const reconciliationApi = {
  unmatched: (params: PaginationParams = {}) =>
    apiRequest<PaginatedResult<Reconciliation>>({
      method: "GET",
      url: "/reconciliation/unmatched",
      params: compactParams(params),
    }),
  match: (transactionId: string, paymentOrderId: string) =>
    apiRequest<Reconciliation>({
      method: "POST",
      url: `/reconciliation/${transactionId}/match`,
      data: { paymentOrderId },
    }),
  unmatch: (transactionId: string, reason: string) =>
    apiRequest<Reconciliation>({
      method: "POST",
      url: `/reconciliation/${transactionId}/unmatch`,
      data: { reason },
    }),
};
