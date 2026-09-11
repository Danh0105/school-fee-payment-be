import { apiRequest } from "@/lib/api-client";
import { compactParams } from "@/lib/utils";
import type { PaginatedResult, PaginationParams, Receipt } from "@/lib/types";
export const receiptsApi = {
  list: (params: PaginationParams = {}) =>
    apiRequest<PaginatedResult<Receipt>>({
      method: "GET",
      url: "/receipts",
      params: compactParams(params),
    }),
  detail: (id: string) =>
    apiRequest<Receipt>({ method: "GET", url: `/receipts/${id}` }),
  cancel: (id: string, reason: string) =>
    apiRequest<Receipt>({
      method: "PATCH",
      url: `/receipts/${id}/cancel`,
      data: { reason },
    }),
};
