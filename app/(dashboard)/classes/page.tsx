"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Plus } from "lucide-react";
import { z } from "zod";
import { DataTable, type DataColumn } from "@/components/data-table";
import { CurrentAcademicYearBadge } from "@/components/current-academic-year-badge";
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
import { useCurrentAcademicYear } from "@/features/academic-years/hooks";
import { classesApi, type ClassPayload } from "@/features/classes/api";
import { useClasses } from "@/features/classes/hooks";
import { useSchools } from "@/features/schools/hooks";
import { useDataTable } from "@/hooks/use-data-table";
import { can, PERMISSIONS } from "@/lib/permissions";
import { queryKeys } from "@/lib/query-keys";
import type { SchoolClass } from "@/lib/types";
import { omitEmpty, optionalText, requiredText } from "@/lib/validation";
import { useAuthStore } from "@/stores/auth-store";

const schema = z.object({
  name: requiredText("Tên lớp"),
  grade: optionalText,
  status: z.enum(["ACTIVE", "INACTIVE"]),
});
type Values = z.infer<typeof schema>;

export default function ClassesPage() {
  const table = useDataTable("name");
  const role = useAuthStore((state) => state.user?.role);
  const schoolId = useAuthStore((state) => state.user?.schoolId) ?? "";
  const [schoolFilter, setSchoolFilter] = useState(schoolId);
  const querySchoolId = schoolFilter || undefined;
  const currentYear = useCurrentAcademicYear(querySchoolId);
  const ready = Boolean(querySchoolId && currentYear.data);
  const result = useClasses(
    {
      ...table.query,
      schoolId: querySchoolId,
      academicYearId: currentYear.data?.id,
    },
    ready,
  );
  const schools = useSchools({ limit: 200, sortBy: "name", sortOrder: "ASC" });
  const fields: FormFieldConfig<Values>[] = [
    { name: "name", label: "Tên lớp", required: true, placeholder: "Lớp 1A1" },
    { name: "grade", label: "Khối", placeholder: "1" },
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
  const columns: DataColumn<SchoolClass>[] = [
    {
      key: "code",
      header: "Mã lớp",
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs font-bold text-teal-700">
          {row.code}
        </span>
      ),
    },
    {
      key: "name",
      header: "Tên lớp",
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-slate-900">{row.name}</span>
      ),
    },
    {
      key: "grade",
      header: "Khối",
      sortable: true,
      render: (row) => row.grade || "—",
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
          <Button variant="ghost" size="icon" className="size-8" asChild>
            <Link href={`/classes/${row.id}`}>
              <Eye />
            </Link>
          </Button>
          {can(role, PERMISSIONS.catalogWrite) && (
            <EntityFormDialog
              title="Cập nhật lớp học"
              description={`Mã ${row.code} · ${currentYear.data?.name ?? "Năm học hiện tại"}`}
              trigger={
                <Button variant="ghost" size="icon" className="size-8">
                  <Pencil />
                </Button>
              }
              schema={schema}
              fields={fields}
              defaultValues={{
                name: row.name,
                grade: row.grade ?? "",
                status: row.status,
              }}
              successMessage="Đã cập nhật lớp học"
              queryKey={queryKeys.classes}
              onSubmit={(values) =>
                classesApi.update(row.id, omitEmpty(values))
              }
            />
          )}
          {can(role, PERMISSIONS.catalogDelete) && (
            <DeleteAction
              label="lớp học"
              description={`Lớp ${row.name} sẽ bị xóa khỏi năm học.`}
              queryKey={queryKeys.classes}
              onDelete={() => classesApi.remove(row.id)}
            />
          )}
        </div>
      ),
    },
  ];
  return (
    <>
      <PageHeader
        eyebrow="Tổ chức đào tạo"
        title="Lớp học"
        description="Theo dõi lớp học của năm học hiện tại theo trường và khối."
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
              value={schoolFilter || undefined}
              onValueChange={(value) => {
                setSchoolFilter(value);
                table.setPage(1);
              }}
              disabled={Boolean(schoolId)}
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
          can(role, PERMISSIONS.catalogWrite) ? (
            <EntityFormDialog
              title="Thêm lớp học"
              trigger={
                <Button disabled={!ready}>
                  <Plus />
                  Thêm lớp
                </Button>
              }
              schema={schema}
              fields={fields}
              defaultValues={{
                name: "",
                grade: "",
                status: "ACTIVE",
              }}
              successMessage="Đã tạo lớp học"
              queryKey={queryKeys.classes}
              onSubmit={(values) => {
                if (!querySchoolId)
                  return Promise.reject(new Error("Vui lòng chọn trường"));
                return classesApi.create({
                  ...(omitEmpty(values) as Omit<ClassPayload, "schoolId">),
                  schoolId: querySchoolId,
                });
              }}
            />
          ) : undefined
        }
      />
    </>
  );
}
