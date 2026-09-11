"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error-messages";
import { queryKeys } from "@/lib/query-keys";
import { importsApi } from "./api";
export function usePreviewImport() {
  return useMutation({
    mutationFn: importsApi.preview,
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
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
