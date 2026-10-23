import { apiRequest, downloadFile } from "@/lib/api-client";
import type { ImportPreview, ImportResult } from "@/lib/types";

export type ImportType = "STUDENTS" | "RECEIVABLES" | "COMBINED";

export interface PreviewImportPayload {
  file: File;
  schoolId?: string;
  academicYearId?: string;
  feePlanId?: string;
  type: ImportType;
  /** Payment list: create a debt and a payment order per row on confirm. */
  createPaymentOrders?: boolean;
  /** YYYY-MM-DD the QR expires; omitted = no expiry. */
  qrExpiresAt?: string;
}

export const importsApi = {
  downloadStudentTemplate: () =>
    downloadFile(
      `/imports/excel/template?type=STUDENTS&_=${Date.now()}`,
      "mau-import-khoi-tao-truong-hoc-sinh.xlsx",
    ),
  preview: ({ file, ...payload }: PreviewImportPayload) => {
    const form = new FormData();
    form.append("file", file);
    Object.entries(payload).forEach(([key, value]) => {
      if (value) form.append(key, String(value));
    });
    return apiRequest<ImportPreview>({
      method: "POST",
      url: "/imports/excel/preview",
      data: form,
    });
  },
  downloadPaymentQrPdf: (importSessionId: string, fileName: string) =>
    downloadFile(`/imports/${importSessionId}/payment-qr.pdf`, fileName),
  confirm: (importSessionId: string) =>
    apiRequest<ImportResult>({
      method: "POST",
      url: "/imports/excel/confirm",
      data: { importSessionId },
    }),
};
