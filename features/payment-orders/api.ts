import { apiRequest } from "@/lib/api-client";
import type { PaymentMethod, PaymentOrder, PaymentOrderQr } from "@/lib/types";

export interface CreatePaymentOrderPayload {
  studentId: string;
  items: { receivableId: string; amount?: string }[];
  paymentMethod?: PaymentMethod;
}
export const paymentOrdersApi = {
  create: (payload: CreatePaymentOrderPayload) =>
    apiRequest<PaymentOrder>({
      method: "POST",
      url: "/payment-orders",
      data: payload,
    }),
  detail: (id: string) =>
    apiRequest<PaymentOrder>({ method: "GET", url: `/payment-orders/${id}` }),
  qr: (id: string) =>
    apiRequest<PaymentOrderQr>({
      method: "GET",
      url: `/payment-orders/${id}/qr`,
    }),
};
