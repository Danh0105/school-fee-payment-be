"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, FileText, Settings2, TriangleAlert } from "lucide-react";
import { DataTable, type DataColumn } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EINVOICE_STATUS_LABELS,
  EInvoiceStatusBadge,
} from "@/features/einvoices/components/einvoice-status-badge";
import { EInvoiceViewerDialog } from "@/features/einvoices/components/einvoice-viewer-dialog";
import {
  useEInvoiceProviderStatus,
  useEInvoices,
} from "@/features/einvoices/hooks";
import { useDataTable } from "@/hooks/use-data-table";
import { formatCurrency, formatDate } from "@/lib/format";
import { can, PERMISSIONS } from "@/lib/permissions";
import type { EInvoice, EInvoiceStatus } from "@/lib/types";
import { useAuthStore } from "@/stores/auth-store";

export default function EInvoicesPage() {
  const table = useDataTable("createdAt");
  const [status, setStatus] = useState("ALL");
  const user = useAuthStore((state) => state.user);
  const provider = useEInvoiceProviderStatus();
  const result = useEInvoices({
    ...table.query,
    schoolId: user?.schoolId ?? undefined,
    status: status === "ALL" ? undefined : status,
  });
  const columns: DataColumn<EInvoice>[] = [
    {
      key: "invoiceNo",
      header: "Hóa đơn",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#e9f3f9] text-[#176b9e]">
            <FileText className="size-4" />
          </span>
          <div>
            <p className="font-mono text-xs font-bold text-teal-700">
              {row.invoiceNo ?? "Chưa cấp số"}
            </p>
            <p className="text-xs text-slate-400">
              Ký hiệu {row.invoiceSeries}
            </p>
          </div>
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
      key: "receipt",
      header: "Phiếu thu",
      render: (row) => (
        <Link
          href={`/receipts/${row.receiptId}`}
          className="font-mono text-xs font-bold text-teal-700 hover:underline"
        >
          {row.receipt?.receiptNumber ?? "Xem phiếu"}
        </Link>
      ),
    },
    {
      key: "issuedAt",
      header: "Ngày phát hành",
      sortable: true,
      render: (row) => formatDate(row.issuedAt, true),
    },
    {
      key: "amount",
      header: "Số tiền",
      render: (row) => (
        <span className="font-display font-bold text-slate-950">
          {formatCurrency(row.receipt?.totalAmount)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      sortable: true,
      render: (row) => (
        <div className="max-w-56">
          <EInvoiceStatusBadge status={row.status} />
          {row.status === "FAILED" && row.errorDescription && (
            <p
              className="mt-1 truncate text-xs text-rose-600"
              title={row.errorDescription}
            >
              {row.errorDescription}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <EInvoiceViewerDialog invoiceId={row.id}>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto size-8"
            aria-label="Xem hóa đơn"
          >
            <Eye />
          </Button>
        </EInvoiceViewerDialog>
      ),
    },
  ];
  return (
    <>
      <PageHeader
        eyebrow="Chứng từ"
        title="Hóa đơn điện tử"
        description="Hóa đơn phát hành qua Viettel S-Invoice cho các phiếu thu học phí."
        actions={
          can(user?.role, PERMISSIONS.accounting) && (
            <Button variant="outline" asChild>
              <Link href="/einvoices/settings">
                <Settings2 />
                Cấu hình
              </Link>
            </Button>
          )
        }
      />
      {provider.data && !provider.data.enabled && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-[#dfa72f]/30 bg-[#fff6df] p-4 text-sm text-[#7a5406]">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <p>
            Tích hợp Viettel S-Invoice đang tắt trên máy chủ. Hóa đơn mới sẽ
            không được phát hành cho tới khi quản trị viên bật tích hợp.
          </p>
        </div>
      )}
      <DataTable
        columns={columns}
        data={result.data?.data}
        meta={result.data?.meta}
        loading={result.isLoading}
        getRowKey={(row) => row.id}
        searchPlaceholder="Tìm số hóa đơn, số phiếu hoặc học sinh…"
        emptyTitle="Chưa có hóa đơn điện tử"
        emptyDescription="Hóa đơn được tạo khi thanh toán khớp với yêu cầu thu, hoặc khi bấm Xuất hóa đơn trên phiếu thu."
        {...table}
        onSearch={table.setSearch}
        onPageChange={table.setPage}
        onLimitChange={table.setLimit}
        onSort={table.toggleSort}
        filters={
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              {(
                Object.entries(EINVOICE_STATUS_LABELS) as [
                  EInvoiceStatus,
                  string,
                ][]
              ).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
    </>
  );
}
