"use client";

import { RotateCcw } from "lucide-react";
import { DataTable, type DataColumn } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { CreateRefundDialog } from "@/features/refunds/components/create-refund-dialog";
import { useRefunds } from "@/features/refunds/hooks";
import { useDataTable } from "@/hooks/use-data-table";
import { formatCurrency, formatDate, shortId } from "@/lib/format";
import { can, PERMISSIONS } from "@/lib/permissions";
import type { Refund } from "@/lib/types";
import { useAuthStore } from "@/stores/auth-store";

export default function RefundsPage() {
  const table = useDataTable("createdAt");
  const result = useRefunds(table.query);
  const role = useAuthStore((state) => state.user?.role);
  const columns: DataColumn<Refund>[] = [
    {
      key: "refundCode",
      header: "Mã hoàn",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
            <RotateCcw className="size-4" />
          </span>
          <span className="font-mono text-xs font-bold text-rose-700">
            {row.refundCode}
          </span>
        </div>
      ),
    },
    {
      key: "paymentTransactionId",
      header: "Giao dịch gốc",
      render: (row) => (
        <span className="font-mono text-xs" title={row.paymentTransactionId}>
          {shortId(row.paymentTransactionId)}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Số tiền",
      sortable: true,
      render: (row) => (
        <span className="font-display font-bold text-slate-950">
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      key: "reason",
      header: "Lý do",
      render: (row) => (
        <span className="line-clamp-2 max-w-md">{row.reason}</span>
      ),
    },
    {
      key: "createdAt",
      header: "Ngày tạo",
      sortable: true,
      render: (row) => formatDate(row.createdAt, true),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];
  return (
    <>
      <PageHeader
        eyebrow="Điều chỉnh dòng tiền"
        title="Hoàn tiền"
        description="Quản lý yêu cầu hoàn từ các khoản thanh toán thừa của học sinh."
      />
      <DataTable
        columns={columns}
        data={result.data?.data}
        meta={result.data?.meta}
        loading={result.isLoading}
        getRowKey={(row) => row.id}
        {...table}
        onSearch={table.setSearch}
        onPageChange={table.setPage}
        onLimitChange={table.setLimit}
        onSort={table.toggleSort}
        actions={
          can(role, PERMISSIONS.accounting) ? <CreateRefundDialog /> : undefined
        }
      />
    </>
  );
}
