import type {
  ParentAccessResponse,
  ParentSchoolOption,
  ParentStudentSummary,
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

export interface ParentAccessPayload {
  schoolId: string;
  identifierCode: string;
}

export const parentPortalApi = {
  schools: () =>
    parentApiRequest<ParentSchoolOption[]>({
      method: "GET",
      url: "/parent-auth/schools",
    }),
  access: (payload: ParentAccessPayload) =>
    parentApiRequest<ParentAccessResponse>({
      method: "POST",
      url: "/parent-auth/access",
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
