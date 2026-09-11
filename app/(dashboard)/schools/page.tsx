"use client";

import Link from "next/link";
import { useState } from "react";
import { Building2, Eye, LockKeyhole, Pencil, Plus } from "lucide-react";
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
import { schoolsApi, type SchoolPayload } from "@/features/schools/api";
import { useSchools } from "@/features/schools/hooks";
import { useDataTable } from "@/hooks/use-data-table";
import { PERMISSIONS, can } from "@/lib/permissions";
import { queryKeys } from "@/lib/query-keys";
import type { School } from "@/lib/types";
import { omitEmpty, optionalText, requiredText } from "@/lib/validation";
import { useAuthStore } from "@/stores/auth-store";

const schema = z.object({
  name: requiredText("Tên trường"),
  address: optionalText,
  phone: optionalText,
  taxCode: optionalText,
  managerInfo: optionalText,
  salesRepresentative: optionalText,
  status: z.enum(["ACTIVE", "INACTIVE"]),
});
type Values = z.infer<typeof schema>;
const fields: FormFieldConfig<Values>[] = [
  {
    name: "name",
    label: "Tên trường",
    required: true,
    placeholder: "Trường Tiểu học Kim Đồng",
  },
  { name: "address", label: "Địa chỉ", className: "sm:col-span-2" },
  { name: "phone", label: "Điện thoại" },
  { name: "taxCode", label: "Mã số thuế" },
  {
    name: "managerInfo",
    label: "Thông tin người quản lý",
    placeholder: "Họ tên, số điện thoại…",
  },
  {
    name: "salesRepresentative",
    label: "Kinh doanh phụ trách",
    placeholder: "Họ tên nhân viên kinh doanh",
  },
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
const defaults: Values = {
  name: "",
  address: "",
  phone: "",
  taxCode: "",
  managerInfo: "",
  salesRepresentative: "",
  status: "ACTIVE",
};

export default function SchoolsPage() {
  const table = useDataTable("createdAt");
  const [status, setStatus] = useState("ALL");
  const result = useSchools({
    ...table.query,
    status: status === "ALL" ? undefined : status,
  });
  const role = useAuthStore((state) => state.user?.role);
  const canWrite = can(role, PERMISSIONS.catalogWrite);
  const columns: DataColumn<School>[] = [
    {
      key: "code",
      header: "Mã trường",
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs font-bold text-teal-700">
          {row.code}
        </span>
      ),
    },
    {
      key: "name",
      header: "Tên trường",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
            <Building2 className="size-4" />
          </span>
          <div>
            <p className="font-semibold text-slate-900">{row.name}</p>
            <p className="max-w-64 truncate text-xs text-slate-400">
              {row.address || "Chưa có địa chỉ"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "managerInfo",
      header: "Người quản lý",
      render: (row) => row.managerInfo || "—",
    },
    {
      key: "salesRepresentative",
      header: "Kinh doanh phụ trách",
      render: (row) => row.salesRepresentative || "—",
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
      className: "w-24",
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            title="Xem chi tiết"
            asChild
          >
            <Link href={`/schools/${row.id}`}>
              <Eye />
            </Link>
          </Button>
          {canWrite && (
            <EntityFormDialog
              title="Cập nhật trường học"
              description="Cập nhật thông tin đơn vị và người phụ trách."
              trigger={
                <Button variant="ghost" size="icon" className="size-8">
                  <Pencil />
                </Button>
              }
              schema={schema}
              fields={fields}
              defaultValues={{
                name: row.name,
                address: row.address ?? "",
                phone: row.phone ?? "",
                taxCode: row.taxCode ?? "",
                managerInfo: row.managerInfo ?? "",
                salesRepresentative: row.salesRepresentative ?? "",
                status: row.status,
              }}
              successMessage="Đã cập nhật trường học"
              queryKey={queryKeys.schools}
              onSubmit={(values) =>
                schoolsApi.update(row.id, omitEmpty(values) as SchoolPayload)
              }
            />
          )}
          {can(role, PERMISSIONS.catalogDelete) && (
            <DeleteAction
              label="trường học"
              description={`Toàn bộ dữ liệu liên quan đến ${row.name} có thể bị ảnh hưởng.`}
              queryKey={queryKeys.schools}
              onDelete={() => schoolsApi.remove(row.id)}
            />
          )}
        </div>
      ),
    },
  ];
  return (
    <>
      <PageHeader
        eyebrow="Danh mục"
        title="Trường học"
        description="Quản lý hồ sơ đơn vị và thông tin người phụ trách."
        actions={
          canWrite ? (
            <EntityFormDialog
              title="Thêm trường học"
              description="Mã trường sẽ được hệ thống tự động sinh."
              trigger={
                <Button>
                  <Plus />
                  Thêm trường
                </Button>
              }
              schema={schema}
              fields={fields}
              defaultValues={defaults}
              successMessage="Đã tạo trường học"
              queryKey={queryKeys.schools}
              onSubmit={(values) =>
                schoolsApi.create(omitEmpty(values) as SchoolPayload)
              }
            />
          ) : (
            <span
              title={`Tài khoản ${role ?? "hiện tại"} chỉ có quyền xem. Cần SUPER_ADMIN hoặc ADMIN để thêm trường.`}
            >
              <Button variant="outline" disabled>
                <LockKeyhole />
                Thêm trường
              </Button>
            </span>
          )
        }
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
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
              <SelectItem value="INACTIVE">Ngừng hoạt động</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </>
  );
}
