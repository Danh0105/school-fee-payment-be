"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BadgeCent,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  GraduationCap,
  MapPin,
  Phone,
  UserCog,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentAcademicYear } from "@/features/academic-years/hooks";
import { useClasses } from "@/features/classes/hooks";
import { useSchool } from "@/features/schools/hooks";
import { useStudents } from "@/features/students/hooks";
import { getErrorMessage } from "@/lib/error-messages";
import { formatDate } from "@/lib/format";

export default function SchoolDetailPage() {
  const id = String(useParams<{ id: string }>().id);
  const school = useSchool(id);
  const currentYear = useCurrentAcademicYear(id);
  const classes = useClasses(
    {
      schoolId: id,
      academicYearId: currentYear.data?.id,
      page: 1,
      limit: 1,
    },
    Boolean(currentYear.data),
  );
  const students = useStudents({ schoolId: id, page: 1, limit: 1 });

  if (school.isLoading) return <Skeleton className="h-[560px] w-full" />;
  if (!school.data)
    return <p className="text-sm text-rose-600">Không tìm thấy trường học.</p>;

  const data = school.data;
  return (
    <>
      <PageHeader
        eyebrow="Chi tiết trường học"
        title={data.name}
        description={`Mã trường ${data.code} · Tạo ngày ${formatDate(data.createdAt)}`}
        actions={
          <Button variant="outline" asChild>
            <Link href="/schools">
              <ArrowLeft />
              Danh sách trường
            </Link>
          </Button>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={Building2}
          label="Trạng thái"
          value={<StatusBadge status={data.status} />}
        />
        <Metric
          icon={CalendarDays}
          label="Năm học hiện tại"
          value={
            currentYear.isLoading
              ? "Đang tải…"
              : currentYear.error
                ? getErrorMessage(currentYear.error)
                : (currentYear.data?.name ?? "—")
          }
        />
        <Metric
          icon={GraduationCap}
          label="Lớp học"
          value={classes.data?.meta.total ?? 0}
        />
        <Metric
          icon={Users}
          label="Học sinh"
          value={students.data?.meta.total ?? 0}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin đơn vị</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <Info icon={MapPin} label="Địa chỉ" value={data.address} />
            <Info icon={Phone} label="Điện thoại" value={data.phone} />
            <Info icon={BadgeCent} label="Mã số thuế" value={data.taxCode} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Thông tin người phụ trách</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <Info
              icon={UserCog}
              label="Người quản lý"
              value={data.managerInfo}
            />
            <Info
              icon={BriefcaseBusiness}
              label="Kinh doanh phụ trách"
              value={data.salesRepresentative}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-5">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-[#edf7ed] text-[#078247]">
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <div className="mt-1 font-display text-2xl font-black text-[#123f36]">
            {value}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Info({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: typeof Building2;
  label: string;
  value?: string | null;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl px-3 py-3 hover:bg-[#f5faf3]">
      <Icon className="mt-0.5 size-4 shrink-0 text-[#237fb5]" />
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-400">{label}</p>
        <p
          className={`mt-1 break-words text-sm font-semibold text-slate-800 ${mono ? "font-mono" : ""}`}
        >
          {value || "Chưa cập nhật"}
        </p>
      </div>
    </div>
  );
}
