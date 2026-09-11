import { apiRequest } from "@/lib/api-client";
import { compactParams } from "@/lib/utils";
import type {
  Adjustment,
  Discount,
  PaginatedResult,
  PaginationParams,
  Receivable,
  StudentCredits,
  StudentLedger,
} from "@/lib/types";

export const receivablesApi = {
  list: (params: PaginationParams = {}) =>
    apiRequest<PaginatedResult<Receivable>>({
      method: "GET",
      url: "/receivables",
      params: compactParams(params),
    }),
  detail: (id: string) =>
    apiRequest<Receivable>({ method: "GET", url: `/receivables/${id}` }),
  byStudent: (studentId: string) =>
    apiRequest<Receivable[]>({
      method: "GET",
      url: `/students/${studentId}/receivables`,
    }),
  discounts: (id: string) =>
    apiRequest<Discount[]>({
      method: "GET",
      url: `/receivables/${id}/discount`,
    }),
  createDiscount: (
    id: string,
    payload: {
      type: "FIXED_AMOUNT" | "PERCENTAGE";
      value: string;
      reason: string;
    },
  ) =>
    apiRequest<Discount>({
      method: "POST",
      url: `/receivables/${id}/discount`,
      data: payload,
    }),
  adjustments: (id: string) =>
    apiRequest<Adjustment[]>({
      method: "GET",
      url: `/receivables/${id}/adjustments`,
    }),
  createAdjustment: (
    id: string,
    payload: { type: "INCREASE" | "DECREASE"; amount: string; reason: string },
  ) =>
    apiRequest<Adjustment>({
      method: "POST",
      url: `/receivables/${id}/adjustments`,
      data: payload,
    }),
  ledger: (studentId: string) =>
    apiRequest<StudentLedger>({
      method: "GET",
      url: `/students/${studentId}/ledger`,
    }),
  credits: (studentId: string) =>
    apiRequest<StudentCredits>({
      method: "GET",
      url: `/students/${studentId}/credits`,
    }),
};
