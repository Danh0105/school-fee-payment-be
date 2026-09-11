"use client";

import { useState } from "react";
import { CheckCircle2, Pencil, Plus, Send } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DataTable, type DataColumn } from "@/components/data-table";
import { CurrentAcademicYearBadge } from "@/components/current-academic-year-badge";
import { DeleteAction } from "@/components/delete-action";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrentAcademicYear } from "@/features/academic-years/hooks";
import { AssignFeePlanDialog } from "@/features/fee-plans/components/assign-fee-plan-dialog";
import { FeePlanDialog } from "@/features/fee-plans/components/fee-plan-dialog";
import { feePlansApi } from "@/features/fee-plans/api";
import { useFeePlans } from "@/features/fee-plans/hooks";
import { useSchools } from "@/features/schools/hooks";
import { useDataTable } from "@/hooks/use-data-table";
import { getErrorMessage } from "@/lib/error-messages";
import { formatCurrency } from "@/lib/format";
import { can, PERMISSIONS } from "@/lib/permissions";
import { queryKeys } from "@/lib/query-keys";
import type { FeePlan } from "@/lib/types";
import { useAuthStore } from "@/stores/auth-store";

export default function FeePlansPage() {
  const table = useDataTable("createdAt");
  const role = useAuthStore((state) => state.user?.role);
  const userSchoolId = useAuthStore((state) => state.user?.schoolId) ?? "";
  const [schoolId, setSchoolId] = useState(userSchoolId);
  const currentYear = useCurrentAcademicYear(schoolId || undefined);
  const ready = Boolean(schoolId && currentYear.data);
  const result = useFeePlans(
    {
      ...table.query,
      schoolId: schoolId || undefined,
      academicYearId: currentYear.data?.id,
    },
    ready,
  );
  const schools = useSchools({ limit: 200, sortBy: "name", sortOrder: "ASC" });
  const columns: DataColumn<FeePlan>[] = [
    {
      key: "code",
      header: "Mã",
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs font-bold text-teal-700">
          {row.code}
        </span>
      ),
    },
    {
      key: "name",
      header: "Kế hoạch thu",
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.name}</p>
          <p className="text-xs text-slate-400">
            {row.feeCategory?.name ?? row.feeCategoryId} ·{" "}
            {currentYear.data?.name}
          </p>
        </div>
      ),
    },
    {
      key: "defaultAmount",
      header: "Số tiền",
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900">
            {formatCurrency(row.defaultAmount)}
          </p>
          <p className="text-xs text-slate-400">
            {formatCurrency(row.unitPrice)} × {row.quantity}
          </p>
        </div>
      ),
    },
    {
      key: "billingType",
      header: "Cách thu",
      render: (row) => <BillingTypeBadge billingType={row.billingType} />,
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
        <div className="flex justify-end gap-1">
          {can(role, PERMISSIONS.feeWrite) && (
            <>
              <ActivateAction plan={row} />
              <AssignFeePlanDialog
                plan={row}
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    disabled={row.status !== "ACTIVE"}
                    title="Gán khoản thu"
                  >
                    <Send />
                  </Button>
                }
              />
              <FeePlanDialog
                plan={row}
                trigger={
                  <Button variant="ghost" size="icon" className="size-8">
                    <Pencil />
                  </Button>
                }
              />
            </>
          )}
          {can(role, PERMISSIONS.feeDelete) && (
            <DeleteAction
              label="kế hoạch thu"
              description={`${row.name} sẽ bị xóa. Công nợ đã phát sinh không tự động bị hủy.`}
              queryKey={queryKeys.feePlans}
              onDelete={() => feePlansApi.remove(row.id)}
            />
          )}
        </div>
      ),
    },
  ];
  return (
    <>
      <PageHeader
        eyebrow="Thiết lập khoản thu"
        title="Kế hoạch thu"
        description="Kế hoạch thu của năm học hiện tại; mã và tên được hệ thống tự động tạo."
      />
      <DataTable
        columns={columns}
        data={result.data?.data}
        meta={result.data?.meta}
        loading={currentYear.isLoading || result.isLoading}
        getRowKey={(row) => row.id}
        {...table}
        onSearch={table.setSearch}
        onPageChange={table.setPage}
        onLimitChange={table.setLimit}
        onSort={table.toggleSort}
        filters={
          <div className="flex flex-wrap gap-2">
            <Select
              value={schoolId || undefined}
              onValueChange={(value) => {
                setSchoolId(value);
                table.setPage(1);
              }}
              disabled={Boolean(userSchoolId)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Chọn trường" />
              </SelectTrigger>
              <SelectContent>
                {schools.data?.data.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <CurrentAcademicYearBadge
              name={currentYear.data?.name}
              loading={currentYear.isLoading}
              error={currentYear.error}
            />
          </div>
        }
        actions={
          can(role, PERMISSIONS.feeWrite) ? (
            <FeePlanDialog
              schoolId={schoolId}
              trigger={
                <Button disabled={!ready}>
                  <Plus />
                  Tạo kế hoạch
                </Button>
              }
            />
          ) : undefined
        }
      />
    </>
  );
}

function BillingTypeBadge({
  billingType,
}: {
  billingType: FeePlan["billingType"];
}) {
  if (billingType === "ONE_TIME") {
    return <Badge variant="secondary">Thu một lần</Badge>;
  }
  if (billingType === "MONTHLY") {
    return <Badge variant="info">Theo tháng (chia học kỳ)</Badge>;
  }
  return <Badge variant="warning">Tùy chỉnh</Badge>;
}

function ActivateAction({ plan }: { plan: FeePlan }) {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => feePlansApi.update(plan.id, { status: "ACTIVE" }),
    onSuccess: () => {
      toast.success("Đã kích hoạt kế hoạch thu");
      void client.invalidateQueries({ queryKey: queryKeys.feePlans });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  if (plan.status !== "DRAFT") return null;
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8 text-emerald-600"
      onClick={() => mutation.mutate()}
      title="Kích hoạt"
    >
      <CheckCircle2 />
    </Button>
  );
}
