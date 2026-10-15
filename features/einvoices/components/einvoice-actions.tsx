"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail, RefreshCw, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { can, PERMISSIONS } from "@/lib/permissions";
import type { EInvoice } from "@/lib/types";
import { useAuthStore } from "@/stores/auth-store";
import { einvoicesApi, getEInvoiceErrorMessage } from "../api";
import { invalidateEInvoices } from "../invalidate";
import { CancelEInvoiceDialog } from "./cancel-einvoice-dialog";

const RETRYABLE: EInvoice["status"][] = ["PENDING", "QUEUED", "FAILED"];
const SYNCABLE: EInvoice["status"][] = [
  "DRAFT",
  "WAITING_INVOICE_NUMBER",
  "FAILED",
];

/** Operator actions the backend allows for the invoice's current status. */
export function EInvoiceActions({ invoice }: { invoice: EInvoice }) {
  const client = useQueryClient();
  const role = useAuthStore((state) => state.user?.role);
  const run = useMutation({
    mutationFn: (action: "retry" | "sync" | "sendEmail") =>
      einvoicesApi[action](invoice.id),
    onSuccess: (_, action) => {
      toast.success(
        {
          retry: "Đã đưa hóa đơn vào hàng đợi phát hành lại",
          sync: "Đang tra cứu số hóa đơn trên Viettel",
          sendEmail: "Đã yêu cầu Viettel gửi hóa đơn cho phụ huynh",
        }[action],
      );
      invalidateEInvoices(client);
    },
    onError: (error) => toast.error(getEInvoiceErrorMessage(error)),
  });
  if (!can(role, PERMISSIONS.accounting)) return null;

  const issued = Boolean(invoice.invoiceNo) && invoice.status !== "CANCELLED";
  const parentEmail = invoice.buyerEmail ?? invoice.student?.parentEmail;
  return (
    <div className="flex flex-wrap gap-2">
      {RETRYABLE.includes(invoice.status) && (
        <Button
          size="sm"
          disabled={run.isPending}
          onClick={() => run.mutate("retry")}
        >
          <RotateCcw />
          Phát hành lại
        </Button>
      )}
      {!invoice.invoiceNo && SYNCABLE.includes(invoice.status) && (
        <Button
          size="sm"
          variant="outline"
          disabled={run.isPending}
          onClick={() => run.mutate("sync")}
        >
          <RefreshCw />
          Đồng bộ với Viettel
        </Button>
      )}
      {issued && (
        <Button
          size="sm"
          variant="outline"
          disabled={run.isPending || !parentEmail}
          title={
            parentEmail
              ? `Gửi tới ${parentEmail}`
              : "Học sinh chưa có email phụ huynh"
          }
          onClick={() => run.mutate("sendEmail")}
        >
          <Mail />
          Gửi email
        </Button>
      )}
      {issued && invoice.invoiceNo && (
        <CancelEInvoiceDialog
          invoiceId={invoice.id}
          invoiceNo={invoice.invoiceNo}
        />
      )}
    </div>
  );
}
