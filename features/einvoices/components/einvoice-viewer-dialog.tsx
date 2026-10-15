"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ChevronDown,
  Download,
  FileClock,
  Loader2,
  Printer,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";
import type { EInvoiceAttempt, EInvoiceDetail } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  einvoicesApi,
  getEInvoiceErrorMessage,
  invoiceFileName,
  isFileNotReady,
  type EInvoiceDownload,
} from "../api";
import { isInProgress, useEInvoice, useEInvoiceFile } from "../hooks";
import { EInvoiceActions } from "./einvoice-actions";
import { EInvoiceStatusBadge } from "./einvoice-status-badge";

const DOWNLOADS: { type: EInvoiceDownload; label: string }[] = [
  { type: "xml", label: "Tải XML" },
  { type: "pdf", label: "Tải về bản thể hiện" },
  { type: "zip", label: "Tải về ZIP" },
];

const OPERATION_LABELS: Record<EInvoiceAttempt["operation"], string> = {
  ISSUE: "Phát hành",
  RECONCILE: "Tra cứu số hóa đơn",
  DOWNLOAD: "Tải file",
  SEND_EMAIL: "Gửi email",
  CANCEL: "Hủy hóa đơn",
  UPDATE_PAYMENT: "Cập nhật thanh toán",
};

const ATTEMPT_LABELS: Record<EInvoiceAttempt["status"], string> = {
  STARTED: "Đang xử lý",
  SUCCEEDED: "Thành công",
  FAILED: "Lỗi",
};

function saveBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Firefox still reads the URL after click() returns.
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export function EInvoiceViewerDialog({
  invoiceId,
  children,
}: {
  invoiceId: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-5xl">
        {open && <EInvoiceViewer invoiceId={invoiceId} />}
      </DialogContent>
    </Dialog>
  );
}

function EInvoiceViewer({ invoiceId }: { invoiceId: string }) {
  const detail = useEInvoice(invoiceId);
  const invoice = detail.data;
  const pdfFile = invoice?.files.find((file) => file.fileType === "PDF");
  const pdf = useEInvoiceFile(
    invoiceId,
    "pdf",
    pdfFile?.createdAt ?? "",
    Boolean(invoice?.invoiceNo && pdfFile),
  );
  const pdfUrl = useMemo(
    () => (pdf.data ? URL.createObjectURL(pdf.data) : null),
    [pdf.data],
  );
  useEffect(
    () => () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    },
    [pdfUrl],
  );
  const frame = useRef<HTMLIFrameElement>(null);
  const [busy, setBusy] = useState<EInvoiceDownload | "request" | null>(null);

  if (detail.isLoading)
    return (
      <>
        <DialogTitle className="sr-only">Xem chi tiết hóa đơn</DialogTitle>
        <Skeleton className="h-[70vh] w-full" />
      </>
    );
  if (!invoice)
    return (
      <>
        <DialogTitle>Xem chi tiết hóa đơn</DialogTitle>
        <p className="mt-4 text-sm text-rose-600">
          {detail.error
            ? getEInvoiceErrorMessage(detail.error)
            : "Không tìm thấy hóa đơn."}
        </p>
      </>
    );

  const hasNumber = Boolean(invoice.invoiceNo);
  const download = async (type: EInvoiceDownload) => {
    setBusy(type);
    try {
      const blob =
        type === "pdf" && pdf.data
          ? pdf.data
          : await einvoicesApi.file(invoice.id, type);
      saveBlob(blob, invoiceFileName(invoice, type));
    } catch (error) {
      toast.error(getEInvoiceErrorMessage(error));
    } finally {
      setBusy(null);
    }
  };
  // A missing file answers 404 and queues the download from Viettel.
  const requestPdf = async () => {
    setBusy("request");
    try {
      await einvoicesApi.file(invoice.id, "pdf");
    } catch (error) {
      if (isFileNotReady(error))
        toast.info("Đã yêu cầu tải bản thể hiện từ Viettel, vui lòng chờ.");
      else toast.error(getEInvoiceErrorMessage(error));
    } finally {
      setBusy(null);
      void detail.refetch();
    }
  };
  const print = () => {
    const view = frame.current?.contentWindow;
    try {
      view?.focus();
      view?.print();
    } catch {
      if (pdfUrl) window.open(pdfUrl, "_blank", "noopener");
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Xem chi tiết hóa đơn</DialogTitle>
        <DialogDescription className="flex flex-wrap items-center gap-2">
          <span>Ký hiệu {invoice.invoiceSeries}</span>
          <span aria-hidden>·</span>
          <span>Số {invoice.invoiceNo ?? "chưa cấp"}</span>
          <EInvoiceStatusBadge status={invoice.status} />
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-b border-slate-100 pb-4">
        {DOWNLOADS.map(({ type, label }) => (
          <Button
            key={type}
            variant="link"
            size="sm"
            disabled={!hasNumber || busy !== null}
            onClick={() => void download(type)}
          >
            {busy === type ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Download />
            )}
            {label}
          </Button>
        ))}
        <Button size="sm" disabled={!pdfUrl} onClick={print}>
          <Printer />
          In
        </Button>
      </div>

      <div className="grid gap-4 py-4 sm:grid-cols-2 lg:grid-cols-4">
        <Info
          label="Học sinh"
          value={invoice.student?.fullName ?? "—"}
          hint={invoice.student?.studentCode}
        />
        <Info
          label="Người mua"
          value={
            invoice.student?.parentName ?? invoice.student?.fullName ?? "—"
          }
          hint={invoice.student?.parentEmail ?? undefined}
        />
        <Info
          label="Phiếu thu"
          value={
            <Link
              href={`/receipts/${invoice.receiptId}`}
              className="font-mono text-teal-700 hover:underline"
            >
              {invoice.receipt?.receiptNumber ?? "Xem phiếu"}
            </Link>
          }
          hint={formatCurrency(invoice.receipt?.totalAmount)}
        />
        <Info
          label="Ngày phát hành"
          value={formatDate(invoice.issuedAt, true)}
          hint={`Mẫu số ${invoice.templateCode}`}
        />
        <Info label="Mã tra cứu" value={invoice.reservationCode ?? "—"} mono />
        <Info label="Mã CQT" value={invoice.codeOfTax ?? "—"} mono />
        <Info label="MST bên bán" value={invoice.supplierTaxCode} mono />
        <Info label="Mã giao dịch" value={invoice.transactionUuid} mono />
      </div>

      {invoice.errorDescription && invoice.status !== "COMPLETED" && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          <p className="font-semibold">
            Viettel báo lỗi
            {invoice.errorCode ? ` (${invoice.errorCode})` : ""}
          </p>
          <p className="mt-1 break-words">{invoice.errorDescription}</p>
        </div>
      )}

      <div className="mb-4">
        <EInvoiceActions invoice={invoice} />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
        {pdfUrl ? (
          <iframe
            ref={frame}
            src={pdfUrl}
            title={`Hóa đơn ${invoice.invoiceNo ?? ""}`}
            className="h-[70vh] w-full bg-white"
          />
        ) : pdf.isLoading ? (
          <Skeleton className="h-[40vh] w-full rounded-none" />
        ) : (
          <PdfPlaceholder
            invoice={invoice}
            hasFile={Boolean(pdfFile)}
            error={pdf.error}
            requesting={busy === "request"}
            onRequest={() => void requestPdf()}
          />
        )}
      </div>

      <AttemptHistory attempts={invoice.attempts} />
    </>
  );
}

function PdfPlaceholder({
  invoice,
  hasFile,
  error,
  requesting,
  onRequest,
}: {
  invoice: EInvoiceDetail;
  hasFile: boolean;
  error: unknown;
  requesting: boolean;
  onRequest: () => void;
}) {
  let message: string;
  let canRequest = false;
  if (!invoice.invoiceNo) {
    message =
      invoice.status === "FAILED"
        ? "Hóa đơn chưa phát hành được — xem lỗi phía trên."
        : invoice.status === "DRAFT"
          ? "Hóa đơn đang là nháp trên cổng Viettel. Ký phát hành trên vinvoice.viettel.vn rồi bấm Đồng bộ với Viettel để lấy số và bản thể hiện."
          : invoice.status === "CANCELLED"
            ? "Hóa đơn đã hủy trước khi được Viettel cấp số."
            : "Viettel chưa cấp số hóa đơn. Bản thể hiện sẽ hiển thị ngay khi phát hành xong.";
  } else if (error && !isFileNotReady(error)) {
    message = getEInvoiceErrorMessage(error);
    canRequest = true;
  } else {
    message = hasFile
      ? "Bản thể hiện chưa sẵn sàng."
      : "Bản thể hiện đang được tải từ Viettel…";
    canRequest = true;
  }
  return (
    <div className="flex h-[40vh] flex-col items-center justify-center gap-3 px-6 text-center">
      {isInProgress(invoice.status) && (
        <Loader2 className="size-6 animate-spin text-[#078247]" />
      )}
      <p className="max-w-md text-sm text-slate-600">{message}</p>
      {canRequest && (
        <Button
          variant="outline"
          size="sm"
          disabled={requesting}
          onClick={onRequest}
        >
          <Download />
          {requesting ? "Đang yêu cầu…" : "Tải lại từ Viettel"}
        </Button>
      )}
    </div>
  );
}

function AttemptHistory({ attempts }: { attempts: EInvoiceAttempt[] }) {
  if (!attempts.length) return null;
  return (
    <Collapsible className="mt-4">
      <CollapsibleTrigger className="group flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#075f3b]">
        <FileClock className="size-4" />
        Lịch sử xử lý với Viettel ({attempts.length})
        <ChevronDown className="size-4 transition group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thời gian</TableHead>
              <TableHead>Thao tác</TableHead>
              <TableHead>Kết quả</TableHead>
              <TableHead>Chi tiết</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attempts.map((attempt) => (
              <TableRow key={attempt.id}>
                <TableCell className="whitespace-nowrap text-xs">
                  {formatDate(attempt.createdAt, true)}
                </TableCell>
                <TableCell className="text-xs">
                  {OPERATION_LABELS[attempt.operation] ?? attempt.operation}
                </TableCell>
                <TableCell
                  className={
                    attempt.status === "FAILED"
                      ? "text-xs font-semibold text-rose-700"
                      : "text-xs"
                  }
                >
                  {ATTEMPT_LABELS[attempt.status]}
                  {attempt.status === "FAILED" && attempt.retryable
                    ? " · tự thử lại"
                    : ""}
                </TableCell>
                <TableCell className="max-w-md break-words text-xs text-slate-500">
                  {[attempt.errorCode, attempt.errorDescription]
                    .filter(Boolean)
                    .join(": ") ||
                    (attempt.durationMs != null
                      ? `${attempt.durationMs} ms`
                      : "—")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CollapsibleContent>
    </Collapsible>
  );
}

function Info({
  label,
  value,
  hint,
  mono,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p
        className={cn(
          "mt-1 truncate font-semibold text-slate-900",
          mono && "font-mono text-xs",
        )}
        title={typeof value === "string" ? value : undefined}
      >
        {value}
      </p>
      {hint && <p className="truncate text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
