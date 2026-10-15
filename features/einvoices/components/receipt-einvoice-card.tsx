"use client";

import { Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import { can, PERMISSIONS } from "@/lib/permissions";
import type { Receipt } from "@/lib/types";
import { useAuthStore } from "@/stores/auth-store";
import { useEInvoiceProviderStatus, useReceiptEInvoice } from "../hooks";
import { EInvoiceActions } from "./einvoice-actions";
import { EInvoiceStatusBadge } from "./einvoice-status-badge";
import { EInvoiceViewerDialog } from "./einvoice-viewer-dialog";
import { IssueEInvoiceButton } from "./issue-einvoice-button";

/** E-invoice state of one receipt, with "Xuất hóa đơn" when it has none. */
export function ReceiptEInvoiceCard({ receipt }: { receipt: Receipt }) {
  const role = useAuthStore((state) => state.user?.role);
  const invoice = useReceiptEInvoice(receipt.id);
  const provider = useEInvoiceProviderStatus();
  const data = invoice.data;

  let body;
  if (invoice.isLoading) body = <Skeleton className="h-10 w-72" />;
  else if (data)
    body = (
      <>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-bold text-teal-700">
            {data.invoiceNo ?? "Chưa cấp số"}
          </span>
          <EInvoiceStatusBadge status={data.status} />
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Ký hiệu {data.invoiceSeries} · Mẫu số {data.templateCode}
          {data.issuedAt
            ? ` · Phát hành ${formatDate(data.issuedAt, true)}`
            : ""}
        </p>
        {data.status === "DRAFT" && (
          <p className="mt-1 text-xs font-medium text-amber-700">
            Kiểm tra và ký phát hành nháp này trên vinvoice.viettel.vn, rồi bấm
            Đồng bộ với Viettel để lấy số hóa đơn.
          </p>
        )}
        {data.status === "FAILED" && data.errorDescription && (
          <p className="mt-1 text-xs font-medium text-rose-600">
            {data.errorDescription}
          </p>
        )}
      </>
    );
  else
    body = (
      <p className="text-sm text-slate-500">
        {receipt.status === "CANCELLED"
          ? "Phiếu thu đã hủy, không xuất hóa đơn."
          : provider.data && !provider.data.enabled
            ? "Chưa có hóa đơn. Tích hợp Viettel S-Invoice đang tắt trên máy chủ."
            : "Phiếu thu chưa có hóa đơn điện tử."}
      </p>
    );

  const canIssue =
    !invoice.isLoading &&
    !data &&
    receipt.status === "ISSUED" &&
    Boolean(receipt.paymentTransactionId) &&
    provider.data?.enabled === true &&
    can(role, PERMISSIONS.accounting);

  return (
    <Card className="mx-auto mb-6 max-w-4xl">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#e9f3f9] text-[#176b9e]">
            <FileText className="size-5" />
          </span>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#237fb5]">
              Hóa đơn điện tử
            </p>
            <div className="mt-1">{body}</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {data && (
            <>
              <EInvoiceViewerDialog invoiceId={data.id}>
                <Button variant="outline">
                  <Eye />
                  Xem hóa đơn
                </Button>
              </EInvoiceViewerDialog>
              <EInvoiceActions invoice={data} />
            </>
          )}
          {canIssue && <IssueEInvoiceButton receipt={receipt} />}
        </div>
      </CardContent>
    </Card>
  );
}
