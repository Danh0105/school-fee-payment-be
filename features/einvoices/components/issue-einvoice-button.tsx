"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileCheck2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import type { Receipt } from "@/lib/types";
import { einvoicesApi, getEInvoiceErrorMessage } from "../api";
import { useEInvoiceConfig } from "../hooks";
import { invalidateEInvoices } from "../invalidate";

export function IssueEInvoiceButton({ receipt }: { receipt: Receipt }) {
  const client = useQueryClient();
  // Until the config loads, describe the cautious outcome: a real invoice.
  const asDraft =
    useEInvoiceConfig(receipt.schoolId).data?.issueMode === "DRAFT";
  const action = asDraft ? "Tạo hóa đơn nháp" : "Xuất hóa đơn";
  const mutation = useMutation({
    mutationFn: () => einvoicesApi.issueForReceipt(receipt.id),
    onSuccess: () => {
      toast.success(
        asDraft
          ? "Đã gửi yêu cầu tạo hóa đơn nháp sang Viettel"
          : "Đã gửi yêu cầu xuất hóa đơn sang Viettel",
      );
      invalidateEInvoices(client);
    },
    onError: (error) => toast.error(getEInvoiceErrorMessage(error)),
  });
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button disabled={mutation.isPending}>
          <FileCheck2 />
          {mutation.isPending ? "Đang gửi…" : action}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {action} cho phiếu {receipt.receiptNumber}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {asDraft
              ? `Hóa đơn nháp ${formatCurrency(receipt.totalAmount)} sẽ được tạo trên cổng Viettel S-Invoice. Hóa đơn chỉ có hiệu lực sau khi kế toán ký phát hành trên vinvoice.viettel.vn.`
              : `Hóa đơn ${formatCurrency(receipt.totalAmount)} sẽ được ký số và phát hành trên Viettel S-Invoice theo cấu hình của trường. Sau khi phát hành, muốn sửa sai phải hủy hoặc lập hóa đơn thay thế.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Quay lại</AlertDialogCancel>
          <AlertDialogAction onClick={() => mutation.mutate()}>
            {action}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
