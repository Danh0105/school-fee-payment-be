"use client";

import { AlertTriangle, Landmark } from "lucide-react";
import { DataTable, type DataColumn } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { MatchDialog } from "@/features/reconciliation/components/match-dialog";
import { useUnmatched } from "@/features/reconciliation/hooks";
import { useDataTable } from "@/hooks/use-data-table";
import { formatCurrency, formatDate, shortId } from "@/lib/format";
import type { Reconciliation } from "@/lib/types";

export default function ReconciliationPage() {
  const table = useDataTable("createdAt");
  const result = useUnmatched(table.query);
  const columns: DataColumn<Reconciliation>[] = [
    {
      key: "transactionTime",
      header: "Giao dịch",
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <Landmark className="size-4" />
          </span>
          <div>
            <p className="font-mono text-xs font-bold text-slate-800">
              {shortId(row.paymentTransaction.externalTransactionId)}
            </p>
            <p className="text-xs text-slate-400">
              {formatDate(row.paymentTransaction.transactionTime, true)}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "transferContent",
      header: "Nội dung nhận được",
      render: (row) => (
        <span className="font-mono text-xs">
          {row.paymentTransaction.transferContent || "—"}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Số tiền",
      render: (row) => (
        <span className="font-display font-bold text-slate-950">
          {formatCurrency(row.paymentTransaction.amount)}
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
        <div className="flex justify-end">
          <MatchDialog transactionId={row.paymentTransactionId} />
        </div>
      ),
    },
  ];
  return (
    <>
      <PageHeader
        eyebrow="Kiểm soát dòng tiền"
        title="Đối soát giao dịch"
        description="Xử lý các giao dịch chưa tự động tìm thấy yêu cầu thanh toán phù hợp."
      />
      <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
        <AlertTriangle className="mt-0.5 size-5 shrink-0" />
        <p className="text-sm leading-6">
          <strong>Kiểm tra kỹ trước khi khớp.</strong> Việc khớp sẽ phân bổ tiền
          vào công nợ và phát hành phiếu thu cho học sinh.
        </p>
      </div>
      <DataTable
        columns={columns}
        data={result.data?.data}
        meta={result.data?.meta}
        loading={result.isLoading}
        getRowKey={(row) => row.id}
        searchPlaceholder="Tìm giao dịch chưa khớp…"
        emptyTitle="Không còn giao dịch chờ đối soát"
        emptyDescription="Tất cả giao dịch đã được xử lý hoặc tự động khớp thành công."
        {...table}
        onSearch={table.setSearch}
        onPageChange={table.setPage}
        onLimitChange={table.setLimit}
        onSort={table.toggleSort}
      />
    </>
  );
}
