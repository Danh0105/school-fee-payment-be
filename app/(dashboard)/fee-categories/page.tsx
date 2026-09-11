"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Tags } from "lucide-react";
import { z } from "zod";
import { DataTable, type DataColumn } from "@/components/data-table";
import { DeleteAction } from "@/components/delete-action";
import {
  EntityFormDialog,
  type FormFieldConfig,
} from "@/components/entity-form-dialog";
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
import {
  feeCategoriesApi,
  type FeeCategoryPayload,
} from "@/features/fee-categories/api";
import { useFeeCategories } from "@/features/fee-categories/hooks";
import { useSchools } from "@/features/schools/hooks";
import { useDataTable } from "@/hooks/use-data-table";
import { can, PERMISSIONS } from "@/lib/permissions";
import { queryKeys } from "@/lib/query-keys";
import type { FeeCategory } from "@/lib/types";
import { omitEmpty, optionalText, requiredText, uuid } from "@/lib/validation";
import { useAuthStore } from "@/stores/auth-store";

const schema = z.object({
  schoolId: uuid("trường"),
  code: requiredText("Mã danh mục"),
  name: requiredText("Tên danh mục"),
  description: optionalText,
  accountingCode: optionalText,
  status: z.enum(["ACTIVE", "INACTIVE"]),
});
type Values = z.infer<typeof schema>;

export default function FeeCategoriesPage() {
  const table = useDataTable("createdAt");
  const role = useAuthStore((state) => state.user?.role);
  const schoolId = useAuthStore((state) => state.user?.schoolId) ?? "";
  const [schoolFilter, setSchoolFilter] = useState(schoolId);
  const result = useFeeCategories({
    ...table.query,
    schoolId: schoolFilter || undefined,
  });
  const schools = useSchools({ limit: 200, sortBy: "name", sortOrder: "ASC" });
  const schoolsById = useMemo(
    () => new Map(schools.data?.data.map((item) => [item.id, item.name])),
    [schools.data],
  );
  const fields: FormFieldConfig<Values>[] = [
    {
      name: "schoolId",
      label: "Trường",
      type: "select",
      required: true,
      options:
        schools.data?.data.map((school) => ({
          value: school.id,
          label: school.name,
        })) ?? [],
    },
    { name: "code", label: "Mã danh mục", required: true, placeholder: "KNS" },
    {
      name: "name",
      label: "Tên khoản thu",
      required: true,
      placeholder: "Kỹ năng sống",
    },
    { name: "accountingCode", label: "Mã kế toán", placeholder: "5113" },
    { name: "description", label: "Mô tả", type: "textarea" },
    {
      name: "status",
      label: "Trạng thái",
      type: "select",
      options: [
        { value: "ACTIVE", label: "Đang hoạt động" },
        { value: "INACTIVE", label: "Ngừng hoạt động" },
      ],
    },
  ];
  const columns: DataColumn<FeeCategory>[] = [
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
      key: "schoolId",
      header: "Trường",
      render: (row) => schoolsById.get(row.schoolId) ?? "—",
    },
    {
      key: "name",
      header: "Danh mục",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <Tags className="size-4" />
          </span>
          <div>
            <p className="font-semibold text-slate-900">{row.name}</p>
            <p className="max-w-72 truncate text-xs text-slate-400">
              {row.description || "Không có mô tả"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "accountingCode",
      header: "Mã kế toán",
      render: (row) => row.accountingCode || "—",
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
          {can(role, PERMISSIONS.feeWrite) && (
            <EntityFormDialog
              title="Cập nhật danh mục"
              trigger={
                <Button variant="ghost" size="icon" className="size-8">
                  <Pencil />
                </Button>
              }
              schema={schema}
              fields={fields}
              defaultValues={{
                schoolId: row.schoolId,
                code: row.code,
                name: row.name,
                description: row.description ?? "",
                accountingCode: row.accountingCode ?? "",
                status: row.status,
              }}
              successMessage="Đã cập nhật danh mục khoản thu"
              queryKey={queryKeys.feeCategories}
              onSubmit={(values) =>
                feeCategoriesApi.update(
                  row.id,
                  omitEmpty(values) as FeeCategoryPayload,
                )
              }
            />
          )}
          {can(role, PERMISSIONS.feeDelete) && (
            <DeleteAction
              label="danh mục khoản thu"
              description={`${row.name} sẽ không còn được dùng cho kế hoạch thu mới.`}
              queryKey={queryKeys.feeCategories}
              onDelete={() => feeCategoriesApi.remove(row.id)}
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
        title="Danh mục khoản thu"
        description="Chuẩn hóa các nhóm doanh thu và mã hạch toán của nhà trường."
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
        filters={
          <Select
            value={schoolFilter || undefined}
            onValueChange={(value) => {
              setSchoolFilter(value);
              table.setPage(1);
            }}
            disabled={Boolean(schoolId)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tất cả trường" />
            </SelectTrigger>
            <SelectContent>
              {schools.data?.data.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
        actions={
          can(role, PERMISSIONS.feeWrite) ? (
            <EntityFormDialog
              title="Thêm danh mục khoản thu"
              trigger={
                <Button>
                  <Plus />
                  Thêm danh mục
                </Button>
              }
              schema={schema}
              fields={fields}
              defaultValues={{
                schoolId: schoolId || schoolFilter,
                code: "",
                name: "",
                description: "",
                accountingCode: "",
                status: "ACTIVE",
              }}
              successMessage="Đã tạo danh mục khoản thu"
              queryKey={queryKeys.feeCategories}
              onSubmit={(values) =>
                feeCategoriesApi.create(omitEmpty(values) as FeeCategoryPayload)
              }
            />
          ) : undefined
        }
      />
    </>
  );
}
