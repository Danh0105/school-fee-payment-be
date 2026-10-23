"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError, getErrorMessage } from "@/lib/error-messages";
import { queryKeys } from "@/lib/query-keys";
import { importsApi } from "./api";
export function usePreviewImport() {
  return useMutation({
    mutationFn: importsApi.preview,
    onError: (error) =>
      toast.error(
        error instanceof ApiError && error.code === "VALIDATION_ERROR"
          ? error.serverMessage
          : getErrorMessage(error),
      ),
  });
}
export function useDownloadStudentImportTemplate() {
  return useMutation({
    mutationFn: importsApi.downloadStudentTemplate,
    onSuccess: () =>
      toast.success("Đã xuất file mẫu khởi tạo trường và học sinh"),
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
export function useConfirmImport() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: importsApi.confirm,
    onSuccess: () => {
      toast.success("Import dữ liệu thành công");
      void client.invalidateQueries({ queryKey: queryKeys.students });
      void client.invalidateQueries({ queryKey: queryKeys.receivables });
      void client.invalidateQueries({ queryKey: queryKeys.paymentOrders });
      void client.invalidateQueries({ queryKey: queryKeys.feePlans });
      void client.invalidateQueries({ queryKey: queryKeys.schools });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDownloadPaymentQrPdf() {
  return useMutation({
    mutationFn: ({
      importSessionId,
      fileName,
    }: {
      importSessionId: string;
      fileName: string;
    }) => importsApi.downloadPaymentQrPdf(importSessionId, fileName),
    onSuccess: () => toast.success("Đã xuất file PDF mã QR thanh toán"),
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
