"use client";

import Link from "next/link";
import { useState } from "react";
import { Download, Eye } from "lucide-react";
import { toast } from "sonner";
import { DataTable, type DataColumn } from "@/components/data-table";
import { CurrentAcademicYearBadge } from "@/components/current-academic-year-badge";
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
import { useClasses } from "@/features/classes/hooks";
import { useFeeCategories } from "@/features/fee-categories/hooks";
import { useReceivables } from "@/features/receivables/hooks";
import { useSchools } from "@/features/schools/hooks";
import { useSemesters } from "@/features/semesters/hooks";
import { useStudents } from "@/features/students/hooks";
import { useDataTable } from "@/hooks/use-data-table";
import { downloadFile } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/error-messages";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Receivable } from "@/lib/types";
import { useAuthStore } from "@/stores/auth-store";

export default function ReceivablesPage() {
  const table = useDataTable("createdAt");
  const userSchoolId =
    useAuthStore((state) => state.user?.schoolId) ?? undefined;
  const [schoolFilter, setSchoolFilter] = useState(userSchoolId ?? "");
  const [status, setStatus] = useState("ALL");
  const [semesterId, setSemesterId] = useState("ALL");
  const [classId, setClassId] = useState("ALL");
  const [studentId, setStudentId] = useState("ALL");
  const [categoryId, setCategoryId] = useState("ALL");
  const schoolId = schoolFilter || undefined;
  const currentYear = useCurrentAcademicYear(schoolId);
  const ready = Boolean(schoolId && currentYear.data);
  const params = {
    ...table.query,
    schoolId,
    status: status === "ALL" ? undefined : status,
    academicYearId: currentYear.data?.id,
    semesterId: semesterId === "ALL" ? undefined : semesterId,
    classId: classId === "ALL" ? undefined : classId,
    studentId: studentId === "ALL" ? undefined : studentId,
    feeCategoryId: categoryId === "ALL" ? undefined : categoryId,
  };
  const result = useReceivables(params, ready);
  const semesters = useSemesters({
    limit: 200,
    academicYearId: currentYear.data?.id,
  });
  const classes = useClasses(
    {
      limit: 200,
      schoolId,
      academicYearId: currentYear.data?.id,
    },
    ready,
  );
  const students = useStudents(
    {
      limit: 200,
      schoolId,
      classId: classId === "ALL" ? undefined : classId,
    },
    ready,
  );
  const categories = useFeeCategories({ limit: 200, schoolId }, ready);
  const schools = useSchools({ limit: 200, sortBy: "name", sortOrder: "ASC" });
  const filters = (
    <div className="flex flex-wrap gap-2">
      <Filter
        value={schoolFilter}
        onChange={(value) => {
          setSchoolFilter(value);
          setSemesterId("ALL");
          setClassId("ALL");
          setStudentId("ALL");
          table.setPage(1);
        }}
        label="Trường"
        allowAll={false}
        options={
          schools.data?.data.map((item) => ({
            value: item.id,
            label: item.name,
          })) ?? []
        }
      />
      <Filter
        value={status}
        onChange={setStatus}
        label="Trạng thái"
        options={[
          { value: "UNPAID", label: "Chưa thu" },
          { value: "PARTIALLY_PAID", label: "Thu một phần" },
          { value: "PAID", label: "Đã thu" },
          { value: "OVERDUE", label: "Quá hạn" },
          { value: "CANCELLED", label: "Đã hủy" },
        ]}
      />
      <CurrentAcademicYearBadge
        name={currentYear.data?.name}
        loading={currentYear.isLoading}
        error={currentYear.error}
      />
      <Filter
        value={semesterId}
        onChange={(value) => {
          setSemesterId(value);
          table.setPage(1);
        }}
        label="Học kỳ"
        options={
          semesters.data?.data.map((item) => ({
            value: item.id,
            label: item.name,
          })) ?? []
        }
      />
      <Filter
        value={classId}
        onChange={(value) => {
          setClassId(value);
          setStudentId("ALL");
          table.setPage(1);
        }}
        label="Lớp"
        options={
          classes.data?.data.map((item) => ({
            value: item.id,
            label: item.name,
          })) ?? []
        }
      />
      <Filter
        value={studentId}
        onChange={(value) => {
          setStudentId(value);
          table.setPage(1);
        }}
        label="Học sinh"
        options={
          students.data?.data.map((item) => ({
            value: item.id,
            label: `${item.studentCode} · ${item.fullName}`,
          })) ?? []
        }
      />
      <Filter
        value={categoryId}
        onChange={setCategoryId}
        label="Danh mục"
        options={
          categories.data?.data.map((item) => ({
            value: item.id,
            label: item.name,
          })) ?? []
        }
      />
    </div>
  );
  const columns: DataColumn<Receivable>[] = [
    {
      key: "receivableCode",
      header: "Mã công nợ",
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs font-bold text-teal-700">
          {row.receivableCode}
        </span>
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
      key: "feePlan",
      header: "Khoản thu",
      render: (row) => (
        <div>
          <p className="font-medium text-slate-800">
            {row.feePlan?.name ?? row.description}
          </p>
          <p className="text-xs text-slate-400">
            Hạn {formatDate(row.dueDate)}
          </p>
        </div>
      ),
    },
    {
      key: "amountDue",
      header: "Phải thu",
      sortable: true,
      render: (row) => formatCurrency(row.amountDue),
    },
    {
      key: "amountPaid",
      header: "Đã thu",
      sortable: true,
      render: (row) => (
        <span className="text-emerald-700">
          {formatCurrency(row.amountPaid)}
        </span>
      ),
    },
    {
      key: "amountOutstanding",
      header: "Còn nợ",
      sortable: true,
      render: (row) => (
        <span className="font-bold text-slate-950">
          {formatCurrency(row.amountOutstanding)}
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
        <Button variant="ghost" size="icon" className="ml-auto size-8" asChild>
          <Link href={`/receivables/${row.id}`}>
            <Eye />
          </Link>
        </Button>
      ),
    },
  ];
  const exportData = () => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) query.set(key, String(value));
    });
    downloadFile(`/exports/receivables.xlsx?${query}`, "cong-no.xlsx").catch(
      (error) => toast.error(getErrorMessage(error)),
    );
  };
  return (
    <>
      <PageHeader
        eyebrow="Kế toán phải thu"
        title="Công nợ học sinh"
        description="Theo dõi số phải thu, đã thu và dư nợ theo từng học sinh, lớp và khoản thu."
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
        filters={filters}
        actions={
          <Button variant="outline" onClick={exportData} disabled={!ready}>
            <Download />
            Xuất Excel
          </Button>
        }
      />
    </>
  );
}

function Filter({
  value,
  onChange,
  label,
  options,
  allowAll = true,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  options: { value: string; label: string }[];
  allowAll?: boolean;
}) {
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger className="w-40">
        <SelectValue placeholder={`Chọn ${label.toLowerCase()}`} />
      </SelectTrigger>
      <SelectContent>
        {allowAll && (
          <SelectItem value="ALL">Tất cả {label.toLowerCase()}</SelectItem>
        )}
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
