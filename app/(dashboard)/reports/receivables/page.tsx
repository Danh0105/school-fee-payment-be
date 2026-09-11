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
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { useReceivablesReport } from "@/features/reports/hooks";
import { useSchools } from "@/features/schools/hooks";
import { useSemesters } from "@/features/semesters/hooks";
import { useStudents } from "@/features/students/hooks";
import { useDataTable } from "@/hooks/use-data-table";
import { downloadFile } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/error-messages";
import { formatCurrency } from "@/lib/format";
import type { Receivable } from "@/lib/types";
import { useAuthStore } from "@/stores/auth-store";

export default function ReceivablesReportPage() {
  const table = useDataTable("createdAt");
  const userSchoolId =
    useAuthStore((state) => state.user?.schoolId) ?? undefined;
  const [schoolFilter, setSchoolFilter] = useState(userSchoolId ?? "");
  const [status, setStatus] = useState("ALL");
  const [semesterId, setSemesterId] = useState("ALL");
  const [classId, setClassId] = useState("ALL");
  const [studentId, setStudentId] = useState("ALL");
  const [categoryId, setCategoryId] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
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
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  };
  const report = useReceivablesReport(params, ready);
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
  const summary = report.data?.summary;
  const filters = (
    <div className="flex flex-wrap gap-2">
      <Filter
        value={schoolFilter}
        onChange={(value) => {
          setSchoolFilter(value);
          setSemesterId("ALL");
          setClassId("ALL");
          setStudentId("ALL");
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
          "UNPAID",
          "PARTIALLY_PAID",
          "PAID",
          "OVERDUE",
          "CANCELLED",
        ].map((value) => ({ value, label: value }))}
      />
      <CurrentAcademicYearBadge
        name={currentYear.data?.name}
        loading={currentYear.isLoading}
        error={currentYear.error}
      />
      <Filter
        value={semesterId}
        onChange={setSemesterId}
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
        onChange={setStudentId}
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
      <Input
        type="date"
        value={fromDate}
        onChange={(event) => setFromDate(event.target.value)}
        className="w-36"
        aria-label="Từ ngày"
      />
      <Input
        type="date"
        value={toDate}
        onChange={(event) => setToDate(event.target.value)}
        className="w-36"
        aria-label="Đến ngày"
      />
    </div>
  );
  const columns: DataColumn<Receivable>[] = [
    {
      key: "receivableCode",
      header: "Mã công nợ",
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
            {row.student?.fullName}
          </p>
          <p className="text-xs text-slate-400">{row.student?.studentCode}</p>
        </div>
      ),
    },
    {
      key: "feePlan",
      header: "Khoản thu",
      render: (row) => row.feePlan?.name ?? row.description,
    },
    {
      key: "amountDue",
      header: "Phải thu",
      render: (row) => formatCurrency(row.amountDue),
    },
    {
      key: "amountPaid",
      header: "Đã thu",
      render: (row) => (
        <span className="text-emerald-700">
          {formatCurrency(row.amountPaid)}
        </span>
      ),
    },
    {
      key: "amountOutstanding",
      header: "Còn nợ",
      render: (row) => (
        <span className="font-semibold">
          {formatCurrency(row.amountOutstanding)}
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
        <Button asChild variant="ghost" size="icon" className="ml-auto size-8">
          <Link href={`/receivables/${row.id}`}>
            <Eye />
          </Link>
        </Button>
      ),
    },
  ];
  const exportReport = () => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (
        value !== undefined &&
        !["page", "limit", "sortBy", "sortOrder"].includes(key)
      )
        query.set(key, String(value));
    });
    downloadFile(
      `/exports/debt-report.xlsx?${query}`,
      "bao-cao-cong-no.xlsx",
    ).catch((error) => toast.error(getErrorMessage(error)));
  };
  return (
    <>
      <PageHeader
        eyebrow="Báo cáo"
        title="Báo cáo công nợ"
        description="Số liệu tổng hợp và danh sách chi tiết theo cùng một phạm vi lọc."
        actions={
          <Button onClick={exportReport} disabled={!ready}>
            <Download />
            Xuất báo cáo
          </Button>
        }
      />
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Summary label="Tổng nguyên giá" value={summary?.totalReceivable} />
        <Summary
          label="Miễn giảm"
          value={summary?.totalDiscount}
          tone="green"
        />
        <Summary label="Tổng phải thu" value={summary?.totalDue} />
        <Summary label="Đã thu" value={summary?.totalPaid} tone="green" />
        <Summary label="Còn nợ" value={summary?.totalOutstanding} tone="red" />
      </div>
      <div className="mb-5 grid gap-4 sm:grid-cols-4">
        <Metric label="Tỷ lệ thu" value={`${summary?.collectionRate ?? 0}%`} />
        <Metric label="Đã đóng đủ" value={summary?.studentsPaid ?? 0} />
        <Metric label="Chưa đóng" value={summary?.studentsUnpaid ?? 0} />
        <Metric label="Đóng một phần" value={summary?.studentsPartial ?? 0} />
      </div>
      <DataTable
        columns={columns}
        data={report.data?.data}
        meta={report.data?.meta}
        loading={currentYear.isLoading || report.isLoading}
        getRowKey={(row) => row.id}
        {...table}
        onSearch={table.setSearch}
        onPageChange={table.setPage}
        onLimitChange={table.setLimit}
        onSort={table.toggleSort}
        filters={filters}
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
        {options.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
function Summary({
  label,
  value,
  tone,
}: {
  label: string;
  value?: string;
  tone?: "green" | "red";
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-slate-400">{label}</p>
        <p
          className={`mt-2 font-display text-lg font-bold ${tone === "green" ? "text-emerald-700" : tone === "red" ? "text-rose-700" : "text-slate-950"}`}
        >
          {formatCurrency(value)}
        </p>
      </CardContent>
    </Card>
  );
}
function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <span className="text-xs text-slate-400">{label}</span>
      <span className="ml-3 font-bold text-slate-900">{value}</span>
    </div>
  );
}
