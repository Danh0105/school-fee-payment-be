"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Download, UserRound } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useClass, useClassStudents } from "@/features/classes/hooks";
import { downloadFile } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import { getErrorMessage } from "@/lib/error-messages";

export default function ClassDetailPage() {
  const id = String(useParams<{ id: string }>().id);
  const klass = useClass(id);
  const students = useClassStudents(id);
  if (klass.isLoading) return <Skeleton className="h-[500px] w-full" />;
  if (!klass.data)
    return <p className="text-sm text-rose-600">Không tìm thấy lớp học.</p>;
  return (
    <>
      <PageHeader
        eyebrow="Chi tiết lớp"
        title={klass.data.name}
        description={`Mã lớp ${klass.data.code} · Khối ${klass.data.grade || "—"}`}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/classes">
                <ArrowLeft />
                Quay lại
              </Link>
            </Button>
            <Button
              onClick={() =>
                downloadFile(
                  `/exports/class/${id}.xlsx`,
                  `lop-${klass.data.code}.xlsx`,
                ).catch((error) => toast.error(getErrorMessage(error)))
              }
            >
              <Download />
              Xuất Excel
            </Button>
          </>
        }
      />
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Sĩ số hiện tại
            </p>
            <p className="mt-2 font-display text-3xl font-bold text-slate-950">
              {students.data?.length ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Trạng thái
            </p>
            <div className="mt-3">
              <StatusBadge status={klass.data.status} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Ngày tạo
            </p>
            <p className="mt-3 font-semibold">
              {formatDate(klass.data.createdAt)}
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Danh sách học sinh</CardTitle>
        </CardHeader>
        <CardContent>
          {students.isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : !students.data?.length ? (
            <div className="flex min-h-52 flex-col items-center justify-center text-center text-slate-500">
              <UserRound className="mb-3 size-9 text-slate-300" />
              <p className="font-semibold text-slate-700">
                Lớp chưa có học sinh
              </p>
              <p className="mt-1 text-sm">
                Xếp lớp từ trang chi tiết học sinh.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã học sinh</TableHead>
                  <TableHead>Họ và tên</TableHead>
                  <TableHead>Ngày sinh</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.data.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <Link
                        href={`/students/${student.id}`}
                        className="font-mono text-xs font-bold text-teal-700 hover:underline"
                      >
                        {student.studentCode}
                      </Link>
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900">
                      {student.fullName}
                    </TableCell>
                    <TableCell>{formatDate(student.dateOfBirth)}</TableCell>
                    <TableCell>
                      <StatusBadge status={student.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
