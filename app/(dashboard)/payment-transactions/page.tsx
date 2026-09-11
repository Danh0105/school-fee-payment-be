"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
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
import { usePaymentTransactions } from "@/features/payment-transactions/hooks";
import { UnmatchDialog } from "@/features/reconciliation/components/unmatch-dialog";
import { useDataTable } from "@/hooks/use-data-table";
import { downloadFile } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/error-messages";
import { formatCurrency, formatDate, shortId } from "@/lib/format";
import { can, PERMISSIONS } from "@/lib/permissions";
import type { PaymentTransaction } from "@/lib/types";
import { useAuthStore } from "@/stores/auth-store";

export default function PaymentTransactionsPage() {
  const table = useDataTable("transactionTime");
  const [status, setStatus] = useState("ALL");
  const schoolId = useAuthStore((state) => state.user?.schoolId) ?? undefined;
  const role = useAuthStore((state) => state.user?.role);
  const params = {
    ...table.query,
    schoolId,
    status: status === "ALL" ? undefined : status,
  };
  const result = usePaymentTransactions(params);
  const columns: DataColumn<PaymentTransaction>[] = [
    {
      key: "externalTransactionId",
      header: "Mã giao dịch",
      sortable: true,
      render: (row) => (
        <div>
          <p
            className="font-mono text-xs font-bold text-teal-700"
            title={row.externalTransactionId}
          >
            {shortId(row.externalTransactionId)}
          </p>
          <p className="text-xs text-slate-400">{row.provider}</p>
        </div>
      ),
    },
    {
      key: "transactionTime",
      header: "Thời gian",
      sortable: true,
      render: (row) => formatDate(row.transactionTime, true),
    },
    {
      key: "transferContent",
      header: "Nội dung",
      render: (row) => (
        <span className="font-mono text-xs">{row.transferContent || "—"}</span>
      ),
    },
    {
      key: "bankCode",
      header: "Ngân hàng",
      render: (row) => row.bankCode || "Tiền mặt",
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
      key: "status",
      header: "Trạng thái",
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex justify-end">
          {can(role, PERMISSIONS.accounting) &&
            ["MATCHED", "ALLOCATED"].includes(row.status) && (
              <UnmatchDialog transactionId={row.id} />
            )}
        </div>
      ),
    },
  ];
  const exportData = () =>
    downloadFile(
      `/exports/payments.xlsx${schoolId ? `?schoolId=${schoolId}` : ""}`,
      "thanh-toan.xlsx",
    ).catch((error) => toast.error(getErrorMessage(error)));
  return (
    <>
      <PageHeader
        eyebrow="Dòng tiền"
        title="Giao dịch thanh toán"
        description="Tất cả giao dịch ngân hàng, VietQR và thu tiền mặt đã đi vào hệ thống."
      />
      <DataTable
        columns={columns}
        data={result.data?.data}
        meta={result.data?.meta}
        loading={result.isLoading}
        getRowKey={(row) => row.id}
        searchPlaceholder="Tìm nội dung hoặc mã giao dịch…"
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
              {[
                "RECEIVED",
                "MATCHED",
                "UNMATCHED",
                "ALLOCATED",
                "REVERSED",
              ].map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
        actions={
          <Button variant="outline" onClick={exportData}>
            <Download />
            Xuất Excel
          </Button>
        }
      />
    </>
  );
}
