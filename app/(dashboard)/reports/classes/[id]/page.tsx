"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useClassReport } from "@/features/reports/hooks";
import { downloadFile } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/error-messages";
import { formatCurrency } from "@/lib/format";

export default function ClassReportPage() {
  const id = String(useParams<{ id: string }>().id);
  const report = useClassReport(id);
  if (report.isLoading) return <Skeleton className="h-[600px]" />;
  if (!report.data)
    return <p className="text-rose-600">Không tìm thấy báo cáo lớp.</p>;
  const data = report.data;
  return (
    <>
      <PageHeader
        eyebrow="Báo cáo theo lớp"
        title={data.className}
        description={`${data.studentCount} học sinh trong lớp`}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/reports/classes">
                <ArrowLeft />
                Chọn lớp khác
              </Link>
            </Button>
            <Button
              onClick={() =>
                downloadFile(
                  `/exports/class/${id}.xlsx`,
                  `lop-${data.className}.xlsx`,
                ).catch((error) => toast.error(getErrorMessage(error)))
              }
            >
              <Download />
              Xuất Excel
            </Button>
          </>
        }
      />
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Summary label="Sĩ số" value={data.studentCount} />
        <Summary label="Tổng phải thu" value={formatCurrency(data.totalDue)} />
        <Summary
          label="Đã thu"
          value={formatCurrency(data.totalPaid)}
          tone="green"
        />
        <Summary
          label="Còn nợ"
          value={formatCurrency(data.totalOutstanding)}
          tone="red"
          sub={`Tỷ lệ thu ${data.collectionRate}%`}
        />
      </div>
      <Card>
        <CardContent className="pt-5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã học sinh</TableHead>
                <TableHead>Họ và tên</TableHead>
                <TableHead className="text-right">Phải thu</TableHead>
                <TableHead className="text-right">Đã thu</TableHead>
                <TableHead className="text-right">Còn nợ</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.students.map((student) => (
                <TableRow key={student.studentId}>
                  <TableCell>
                    <Link
                      href={`/students/${student.studentId}`}
                      className="font-mono text-xs font-bold text-teal-700 hover:underline"
                    >
                      {student.studentCode}
                    </Link>
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900">
                    {student.fullName}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(student.amountDue)}
                  </TableCell>
                  <TableCell className="text-right text-emerald-700">
                    {formatCurrency(student.amountPaid)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(student.amountOutstanding)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={student.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
function Summary({
  label,
  value,
  tone,
  sub,
}: {
  label: string;
  value: string | number;
  tone?: "green" | "red";
  sub?: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs text-slate-400">{label}</p>
        <p
          className={`mt-2 font-display text-2xl font-bold ${tone === "green" ? "text-emerald-700" : tone === "red" ? "text-rose-700" : "text-slate-950"}`}
        >
          {value}
        </p>
        {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
      </CardContent>
    </Card>
  );
}
