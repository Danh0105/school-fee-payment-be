import { Badge } from "@/components/ui/badge";

const LABELS: Record<string, string> = {
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Ngừng hoạt động",
  DRAFT: "Bản nháp",
  CLOSED: "Đã đóng",
  CANCELLED: "Đã hủy",
  UNPAID: "Chưa thu",
  PARTIALLY_PAID: "Thu một phần",
  PAID: "Đã thu",
  OVERDUE: "Quá hạn",
  PENDING: "Đang chờ",
  FAILED: "Thất bại",
  RECEIVED: "Đã nhận",
  MATCHED: "Đã khớp",
  UNMATCHED: "Chưa khớp",
  ALLOCATED: "Đã phân bổ",
  REVERSED: "Đã đảo",
  ISSUED: "Đã phát hành",
  REQUESTED: "Đã yêu cầu",
  APPROVED: "Đã duyệt",
  COMPLETED: "Hoàn tất",
  REJECTED: "Từ chối",
  AVAILABLE: "Khả dụng",
  HELD: "Đang giữ",
  REFUNDED: "Đã hoàn",
  GRADUATED: "Đã tốt nghiệp",
  TRANSFERRED: "Đã chuyển trường",
  AUTO_MATCHED: "Tự động khớp",
  MANUAL_MATCHED: "Khớp thủ công",
  AMOUNT_MISMATCH: "Lệch số tiền",
  DUPLICATE: "Trùng lặp",
};

export function StatusBadge({ status }: { status: string }) {
  const variant = [
    "ACTIVE",
    "PAID",
    "MATCHED",
    "ALLOCATED",
    "ISSUED",
    "COMPLETED",
    "AVAILABLE",
    "AUTO_MATCHED",
    "MANUAL_MATCHED",
  ].includes(status)
    ? "success"
    : ["OVERDUE", "FAILED", "CANCELLED", "REVERSED", "REJECTED"].includes(
          status,
        )
      ? "destructive"
      : [
            "PENDING",
            "DRAFT",
            "PARTIALLY_PAID",
            "RECEIVED",
            "REQUESTED",
            "AMOUNT_MISMATCH",
          ].includes(status)
        ? "warning"
        : ["UNPAID", "UNMATCHED"].includes(status)
          ? "info"
          : "secondary";
  return <Badge variant={variant}>{LABELS[status] ?? status}</Badge>;
}
