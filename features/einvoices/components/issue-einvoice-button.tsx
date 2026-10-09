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
import { invalidateEInvoices } from "../invalidate";

export function IssueEInvoiceButton({ receipt }: { receipt: Receipt }) {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => einvoicesApi.issueForReceipt(receipt.id),
    onSuccess: () => {
      toast.success("Đã gửi yêu cầu xuất hóa đơn sang Viettel");
      invalidateEInvoices(client);
    },
    onError: (error) => toast.error(getEInvoiceErrorMessage(error)),
  });
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button disabled={mutation.isPending}>
          <FileCheck2 />
          {mutation.isPending ? "Đang gửi…" : "Xuất hóa đơn"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Xuất hóa đơn điện tử cho phiếu {receipt.receiptNumber}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Hóa đơn {formatCurrency(receipt.totalAmount)} sẽ được ký số và phát
            hành trên Viettel S-Invoice theo cấu hình của trường. Sau khi phát
            hành, muốn sửa sai phải hủy hoặc lập hóa đơn thay thế.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Quay lại</AlertDialogCancel>
          <AlertDialogAction onClick={() => mutation.mutate()}>
            Xuất hóa đơn
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
