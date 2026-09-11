"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, UserRound } from "lucide-react";
import { z } from "zod";
import { DataTable, type DataColumn } from "@/components/data-table";
import { CurrentAcademicYearBadge } from "@/components/current-academic-year-badge";
import { DeleteAction } from "@/components/delete-action";
import {
  EntityFormDialog,
  type FormFieldConfig,
} from "@/components/entity-form-dialog";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClasses } from "@/features/classes/hooks";
import { useCurrentAcademicYear } from "@/features/academic-years/hooks";
import { useSchools } from "@/features/schools/hooks";
import { StudentCreateDialog } from "@/features/students/components/student-create-dialog";
import { studentsApi, type StudentPayload } from "@/features/students/api";
import { useStudents } from "@/features/students/hooks";
import { useDataTable } from "@/hooks/use-data-table";
import { formatDate } from "@/lib/format";
import { can, PERMISSIONS } from "@/lib/permissions";
import { queryKeys } from "@/lib/query-keys";
import type { Student } from "@/lib/types";
import { omitEmpty, optionalText, requiredText } from "@/lib/validation";
import { useAuthStore } from "@/stores/auth-store";

const schema = z.object({
  identifierCode: optionalText,
  fullName: requiredText("Họ và tên"),
  dateOfBirth: optionalText,
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional().or(z.literal("")),
  address: optionalText,
  phone: optionalText,
  parentName: optionalText,
  parentPhone: optionalText,
  parentEmail: z
    .union([z.literal(""), z.email("Email phụ huynh chưa hợp lệ")])
    .optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "GRADUATED", "TRANSFERRED"]),
});
type Values = z.infer<typeof schema>;

export default function StudentsPage() {
  const table = useDataTable("createdAt");
  const role = useAuthStore((state) => state.user?.role);
  const schoolId = useAuthStore((state) => state.user?.schoolId) ?? "";
  const [schoolFilter, setSchoolFilter] = useState(schoolId);
  const [classId, setClassId] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const querySchoolId = schoolFilter || undefined;
  const currentYear = useCurrentAcademicYear(querySchoolId);
  const ready = Boolean(querySchoolId && currentYear.data);
  const result = useStudents(
    {
      ...table.query,
      schoolId: querySchoolId,
      classId: classId === "ALL" ? undefined : classId,
      status: status === "ALL" ? undefined : status,
    },
    Boolean(querySchoolId),
  );
  const schools = useSchools({ limit: 200, sortBy: "name", sortOrder: "ASC" });
  const classes = useClasses(
    {
      limit: 200,
      schoolId: querySchoolId,
      academicYearId: currentYear.data?.id,
      sortBy: "name",
      sortOrder: "ASC",
    },
    ready,
  );
  const fields: FormFieldConfig<Values>[] = [
    { name: "fullName", label: "Họ và tên", required: true },
    { name: "identifierCode", label: "Mã định danh" },
    { name: "dateOfBirth", label: "Ngày sinh", type: "date" },
    {
      name: "gender",
      label: "Giới tính",
      type: "select",
      options: [
        { value: "MALE", label: "Nam" },
        { value: "FEMALE", label: "Nữ" },
        { value: "OTHER", label: "Khác" },
      ],
    },
    { name: "phone", label: "Số điện thoại" },
    { name: "address", label: "Địa chỉ", className: "sm:col-span-2" },
    {
      name: "status",
      label: "Trạng thái",
      type: "select",
      className: "sm:col-span-2",
      options: [
        { value: "ACTIVE", label: "Đang học" },
        { value: "INACTIVE", label: "Ngừng học" },
        { value: "GRADUATED", label: "Đã tốt nghiệp" },
        { value: "TRANSFERRED", label: "Đã chuyển trường" },
      ],
    },
  ];
  const columns: DataColumn<Student>[] = [
    {
      key: "studentCode",
      header: "Mã học sinh",
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs font-bold text-teal-700">
          {row.studentCode}
        </span>
      ),
    },
    {
      key: "fullName",
      header: "Học sinh",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
            <UserRound className="size-4" />
          </span>
          <div>
            <p className="font-semibold text-slate-900">{row.fullName}</p>
            <p className="text-xs text-slate-400">
              {formatDate(row.dateOfBirth)}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "identifierCode",
      header: "Mã định danh",
      render: (row) => (
        <span className="font-mono text-xs">{row.identifierCode || "—"}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" className="size-8" asChild>
            <Link href={`/students/${row.id}`}>
              <Eye />
            </Link>
          </Button>
          {can(role, PERMISSIONS.studentWrite) && (
            <EntityFormDialog
              title="Cập nhật học sinh"
              trigger={
                <Button variant="ghost" size="icon" className="size-8">
                  <Pencil />
                </Button>
              }
              schema={schema}
              fields={fields}
              defaultValues={{
                identifierCode: row.identifierCode ?? "",
                fullName: row.fullName,
                dateOfBirth: row.dateOfBirth ?? "",
                gender: row.gender ?? "",
                address: row.address ?? "",
                phone: row.phone ?? "",
                parentName: row.parentName ?? "",
                parentPhone: row.parentPhone ?? "",
                parentEmail: row.parentEmail ?? "",
                status: row.status,
              }}
              successMessage="Đã cập nhật học sinh"
              queryKey={queryKeys.students}
              onSubmit={(values) =>
                studentsApi.update(
                  row.id,
                  omitEmpty(values) as Partial<StudentPayload>,
                )
              }
            />
          )}
          {can(role, PERMISSIONS.studentWrite) && (
            <DeleteAction
              label="học sinh"
              description={`Hồ sơ ${row.fullName} sẽ được xóa mềm và ẩn khỏi danh sách.`}
              queryKey={queryKeys.students}
              onDelete={() => studentsApi.remove(row.id)}
            />
          )}
        </div>
      ),
    },
  ];
  return (
    <>
      <PageHeader
        eyebrow="Hồ sơ"
        title="Học sinh"
        description="Tìm kiếm hồ sơ, theo dõi công nợ và lịch sử kế toán của từng học sinh."
      />
      <DataTable
        columns={columns}
        data={result.data?.data}
        meta={result.data?.meta}
        loading={result.isLoading}
        getRowKey={(row) => row.id}
        searchPlaceholder="Tìm theo tên hoặc mã học sinh…"
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
                setClassId("ALL");
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
            <ListFilter
              value={classId}
              onChange={setClassId}
              allLabel="Tất cả lớp"
              options={
                classes.data?.data.map((item) => ({
                  value: item.id,
                  label: item.name,
                })) ?? []
              }
            />
            <ListFilter
              value={status}
              onChange={setStatus}
              allLabel="Tất cả trạng thái"
              options={[
                { value: "ACTIVE", label: "Đang học" },
                { value: "INACTIVE", label: "Ngừng học" },
                { value: "GRADUATED", label: "Đã tốt nghiệp" },
                { value: "TRANSFERRED", label: "Đã chuyển trường" },
              ]}
            />
            <CurrentAcademicYearBadge
              name={currentYear.data?.name}
              loading={currentYear.isLoading}
              error={currentYear.error}
            />
          </div>
        }
        actions={
          can(role, PERMISSIONS.studentWrite) ? (
            <StudentCreateDialog
              schoolId={querySchoolId ?? ""}
              classId={classId === "ALL" ? "" : classId}
            />
          ) : undefined
        }
      />
    </>
  );
}

function ListFilter({
  value,
  onChange,
  allLabel,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  allLabel: string;
  options: { value: string; label: string }[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
