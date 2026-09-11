"use client";

import { Badge } from "@/components/ui/badge";
import { getErrorMessage } from "@/lib/error-messages";

interface CurrentAcademicYearBadgeProps {
  name?: string;
  loading?: boolean;
  error?: unknown;
  emptyLabel?: string;
}

export function CurrentAcademicYearBadge({
  name,
  loading = false,
  error,
  emptyLabel = "Chọn trường để lấy năm học",
}: CurrentAcademicYearBadgeProps) {
  return (
    <Badge variant={error ? "destructive" : "secondary"}>
      {loading
        ? "Đang tải năm học…"
        : error
          ? getErrorMessage(error)
          : (name ?? emptyLabel)}
    </Badge>
  );
}
