import type {
  ParentAccessResponse,
  ParentSchoolOption,
  ParentStudentSummary,
  ParentStudentLookupCandidate,
  PaymentMethod,
  PaymentOrder,
  PaymentOrderQr,
  Receivable,
} from "@/lib/types";
import { parentApiRequest } from "./api-client";

export interface CreateParentPaymentOrderPayload {
  items: { receivableId: string; amount?: string }[];
  paymentMethod?: PaymentMethod;
}

export interface ParentSearchPayload {
  schoolId: string;
  fullName: string;
}

export interface ParentVerifyPayload {
  lookupToken: string;
  password: string;
}

export const parentPortalApi = {
  schools: () =>
    parentApiRequest<ParentSchoolOption[]>({
      method: "GET",
      url: "/parent-auth/schools",
    }),
  search: (payload: ParentSearchPayload) =>
    parentApiRequest<ParentStudentLookupCandidate[]>({
      method: "POST",
      url: "/parent-auth/search",
      data: payload,
    }),
  verify: (payload: ParentVerifyPayload) =>
    parentApiRequest<ParentAccessResponse>({
      method: "POST",
      url: "/parent-auth/verify",
      data: payload,
    }),
  me: () =>
    parentApiRequest<ParentStudentSummary>({
      method: "GET",
      url: "/parent/me",
    }),
  receivables: () =>
    parentApiRequest<Receivable[]>({
      method: "GET",
      url: "/parent/receivables",
    }),
  createPaymentOrder: (payload: CreateParentPaymentOrderPayload) =>
    parentApiRequest<PaymentOrder>({
      method: "POST",
      url: "/parent/payment-orders",
      data: payload,
    }),
  paymentOrder: (id: string) =>
    parentApiRequest<PaymentOrder>({
      method: "GET",
      url: `/parent/payment-orders/${id}`,
    }),
  paymentOrderQr: (id: string) =>
    parentApiRequest<PaymentOrderQr>({
      method: "GET",
      url: `/parent/payment-orders/${id}/qr`,
    }),
};
