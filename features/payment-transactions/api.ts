import { apiRequest } from "@/lib/api-client";
import { compactParams } from "@/lib/utils";
import type {
  PaginatedResult,
  PaginationParams,
  PaymentTransaction,
} from "@/lib/types";

export interface ManualTransactionPayload {
  externalTransactionId: string;
  amount: string;
  transferContent: string;
  bankCode?: string;
  bankAccountNumber?: string;
  transactionTime?: string;
}
export const paymentTransactionsApi = {
  list: (params: PaginationParams = {}) =>
    apiRequest<PaginatedResult<PaymentTransaction>>({
      method: "GET",
      url: "/payment-transactions",
      params: compactParams(params),
    }),
  detail: (id: string) =>
    apiRequest<PaymentTransaction>({
      method: "GET",
      url: `/payment-transactions/${id}`,
    }),
  manual: (payload: ManualTransactionPayload) =>
    apiRequest<unknown>({
      method: "POST",
      url: "/payment-transactions/manual",
      data: payload,
    }),
};
