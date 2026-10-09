import { apiClient, apiRequest } from "@/lib/api-client";
import { ApiError, getErrorMessage } from "@/lib/error-messages";
import { compactParams } from "@/lib/utils";
import type {
  EInvoice,
  EInvoiceConfig,
  EInvoiceDetail,
  EInvoiceProviderStatus,
  PaginatedResult,
  PaginationParams,
} from "@/lib/types";

export type EInvoiceDownload = "pdf" | "zip" | "xml";

export interface EInvoiceConfigPayload {
  enabled: boolean;
  autoIssue: boolean;
  supplierTaxCode: string;
  templateCode: string;
  invoiceSeries: string;
  taxPercentage: string;
  pricesIncludeTax?: boolean;
  signingMode: string;
}

export const einvoicesApi = {
  list: (params: PaginationParams = {}) =>
    apiRequest<PaginatedResult<EInvoice>>({
      method: "GET",
      url: "/einvoices",
      params: compactParams(params),
    }),
  detail: (id: string) =>
    apiRequest<EInvoiceDetail>({ method: "GET", url: `/einvoices/${id}` }),
  providerStatus: () =>
    apiRequest<EInvoiceProviderStatus>({
      method: "GET",
      url: "/einvoices/provider-status",
    }),
  config: (schoolId: string) =>
    apiRequest<EInvoiceConfig | null>({
      method: "GET",
      url: `/einvoices/config/${schoolId}`,
    }),
  saveConfig: (schoolId: string, data: EInvoiceConfigPayload) =>
    apiRequest<EInvoiceConfig>({
      method: "PUT",
      url: `/einvoices/config/${schoolId}`,
      data,
    }),
  issueForReceipt: (receiptId: string) =>
    apiRequest<EInvoice>({
      method: "POST",
      url: `/einvoices/receipts/${receiptId}/issue`,
    }),
  retry: (id: string) =>
    apiRequest<{ queued: boolean }>({
      method: "POST",
      url: `/einvoices/${id}/retry`,
    }),
  sync: (id: string) =>
    apiRequest<{ queued: boolean }>({
      method: "POST",
      url: `/einvoices/${id}/sync`,
    }),
  sendEmail: (id: string) =>
    apiRequest<{ queued: boolean }>({
      method: "POST",
      url: `/einvoices/${id}/send-email`,
    }),
  cancel: (id: string, reason: string) =>
    apiRequest<{ cancelled: boolean }>({
      method: "POST",
      url: `/einvoices/${id}/cancel`,
      data: { reason },
    }),
  /** Files sit behind the bearer token, so they are fetched as blobs. */
  file: async (id: string, type: EInvoiceDownload): Promise<Blob> => {
    const response = await apiClient.get(`/einvoices/${id}/${type}`, {
      responseType: "blob",
      timeout: 60_000,
    });
    return response.data as Blob;
  },
};

/** Viettel's invoiceNo already carries the series (e.g. C26TAA12). */
export function invoiceLabel(
  invoice: Pick<EInvoice, "invoiceSeries" | "invoiceNo">,
): string {
  return invoice.invoiceNo ?? `${invoice.invoiceSeries} · chưa cấp số`;
}

export function invoiceFileName(
  invoice: Pick<EInvoice, "invoiceSeries" | "invoiceNo" | "id">,
  type: EInvoiceDownload,
): string {
  const base = invoice.invoiceNo ?? `${invoice.invoiceSeries}-${invoice.id}`;
  return `hoa-don-${base.replace(/[^a-zA-Z0-9._-]/g, "_")}.${type}`;
}

/**
 * The backend explains e-invoice refusals ("Trường chưa bật hóa đơn điện
 * tử", "File chưa sẵn sàng…") in a message that the generic code text would
 * otherwise hide.
 */
export function getEInvoiceErrorMessage(error: unknown): string {
  if (
    error instanceof ApiError &&
    !error.details &&
    ["VALIDATION_ERROR", "NOT_FOUND", "INTERNAL_ERROR"].includes(error.code) &&
    error.status !== undefined &&
    error.status < 500 &&
    error.serverMessage
  )
    return error.serverMessage;
  return getErrorMessage(error);
}

export function isFileNotReady(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}
