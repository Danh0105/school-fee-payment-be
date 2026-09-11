import { apiRequest } from "@/lib/api-client";
import type { ImportPreview, ImportResult } from "@/lib/types";
export interface PreviewImportPayload {
  file: File;
  schoolId: string;
  academicYearId: string;
  feePlanId?: string;
  type: "STUDENTS" | "RECEIVABLES" | "COMBINED";
}
export const importsApi = {
  preview: ({ file, ...payload }: PreviewImportPayload) => {
    const form = new FormData();
    form.append("file", file);
    Object.entries(payload).forEach(([key, value]) => {
      if (value) form.append(key, value);
    });
    return apiRequest<ImportPreview>({
      method: "POST",
      url: "/imports/excel/preview",
      data: form,
    });
  },
  confirm: (importSessionId: string) =>
    apiRequest<ImportResult>({
      method: "POST",
      url: "/imports/excel/confirm",
      data: { importSessionId },
    }),
};
