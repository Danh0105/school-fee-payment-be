import { Badge } from "@/components/ui/badge";
import type { EInvoiceStatus } from "@/lib/types";

export const EINVOICE_STATUS_LABELS: Record<EInvoiceStatus, string> = {
  PENDING: "Chờ phát hành",
  QUEUED: "Trong hàng đợi",
  PROCESSING: "Đang phát hành",
  WAITING_INVOICE_NUMBER: "Chờ cấp số",
  ISSUED: "Đã cấp số",
  FILE_PENDING: "Đang tải file",
  COMPLETED: "Đã phát hành",
  FAILED: "Phát hành lỗi",
  CANCELLED: "Đã hủy",
  ADJUSTED: "Đã điều chỉnh",
  REPLACED: "Đã thay thế",
};

const VARIANTS: Record<
  EInvoiceStatus,
  "success" | "warning" | "destructive" | "secondary" | "info"
> = {
  PENDING: "warning",
  QUEUED: "warning",
  PROCESSING: "info",
  WAITING_INVOICE_NUMBER: "info",
  ISSUED: "info",
  FILE_PENDING: "info",
  COMPLETED: "success",
  FAILED: "destructive",
  CANCELLED: "destructive",
  ADJUSTED: "secondary",
  REPLACED: "secondary",
};

export function EInvoiceStatusBadge({ status }: { status: EInvoiceStatus }) {
  return (
    <Badge variant={VARIANTS[status] ?? "secondary"}>
      {EINVOICE_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
