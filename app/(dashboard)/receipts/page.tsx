"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, ReceiptText } from "lucide-react";
import { DataTable, type DataColumn } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useReceipts } from "@/features/receipts/hooks";
import { useDataTable } from "@/hooks/use-data-table";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Receipt } from "@/lib/types";
import { useAuthStore } from "@/stores/auth-store";

export default function ReceiptsPage() {
  const table = useDataTable("issuedAt");
  const [status, setStatus] = useState("ALL");
  const schoolId = useAuthStore((state) => state.user?.schoolId) ?? undefined;
  const result = useReceipts({
    ...table.query,
    schoolId,
    status: status === "ALL" ? undefined : status,
  });
  const columns: DataColumn<Receipt>[] = [
    {
      key: "receiptNumber",
      header: "Số phiếu",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
            <ReceiptText className="size-4" />
          </span>
          <span className="font-mono text-xs font-bold text-teal-700">
            {row.receiptNumber}
          </span>
        </div>
      ),
    },
    {
      key: "student",
      header: "Học sinh",
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900">
            {row.student?.fullName ?? "—"}
          </p>
          <p className="font-mono text-xs text-slate-400">
            {row.student?.studentCode}
          </p>
        </div>
      ),
    },
    {
      key: "issuedAt",
      header: "Ngày phát hành",
      sortable: true,
      render: (row) => formatDate(row.issuedAt, true),
    },
    {
      key: "paymentMethod",
      header: "Phương thức",
      render: (row) => row.paymentMethod,
    },
    {
      key: "totalAmount",
      header: "Tổng tiền",
      sortable: true,
      render: (row) => (
        <span className="font-display font-bold text-slate-950">
          {formatCurrency(row.totalAmount)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <Button variant="ghost" size="icon" className="ml-auto size-8" asChild>
          <Link href={`/receipts/${row.id}`}>
            <Eye />
          </Link>
        </Button>
      ),
    },
  ];
  return (
    <>
      <PageHeader
        eyebrow="Chứng từ"
        title="Phiếu thu"
        description="Tra cứu chứng từ thu tiền đã phát hành cho học sinh và phụ huynh."
      />
      <DataTable
        columns={columns}
        data={result.data?.data}
        meta={result.data?.meta}
        loading={result.isLoading}
        getRowKey={(row) => row.id}
        searchPlaceholder="Tìm số phiếu hoặc tên học sinh…"
        {...table}
        onSearch={table.setSearch}
        onPageChange={table.setPage}
        onLimitChange={table.setLimit}
        onSort={table.toggleSort}
        filters={
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="ISSUED">Đã phát hành</SelectItem>
              <SelectItem value="CANCELLED">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </>
  );
}
