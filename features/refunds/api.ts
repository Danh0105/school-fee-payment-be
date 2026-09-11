import { apiRequest } from "@/lib/api-client";
import { compactParams } from "@/lib/utils";
import type { PaginatedResult, PaginationParams, Refund } from "@/lib/types";
export const refundsApi = {
  list: (params: PaginationParams = {}) =>
    apiRequest<PaginatedResult<Refund>>({
      method: "GET",
      url: "/refunds",
      params: compactParams(params),
    }),
  create: (payload: {
    paymentTransactionId: string;
    amount: string;
    reason: string;
  }) => apiRequest<Refund>({ method: "POST", url: "/refunds", data: payload }),
  detail: (id: string) =>
    apiRequest<Refund>({ method: "GET", url: `/refunds/${id}` }),
};
