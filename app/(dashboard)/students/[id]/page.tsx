"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import Decimal from "decimal.js";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Mail,
  MapPin,
  Phone,
  UserRoundPlus,
  WalletCards,
} from "lucide-react";
import { z } from "zod";
import {
  EntityFormDialog,
  type FormFieldConfig,
} from "@/components/entity-form-dialog";
import { CurrentAcademicYearBadge } from "@/components/current-academic-year-badge";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentAcademicYear } from "@/features/academic-years/hooks";
import { useClasses } from "@/features/classes/hooks";
import { CreatePaymentOrderDialog } from "@/features/payment-orders/components/create-payment-order-dialog";
import {
  useStudentCredits,
  useStudentLedger,
  useStudentReceivables,
} from "@/features/receivables/hooks";
import { useSemesters } from "@/features/semesters/hooks";
import {
  studentsApi,
  type AssignStudentPayload,
} from "@/features/students/api";
import { useStudent } from "@/features/students/hooks";
import { formatCurrency, formatDate } from "@/lib/format";
import { can, PERMISSIONS } from "@/lib/permissions";
import { queryKeys } from "@/lib/query-keys";
import type { FeePlan, Receivable, Semester } from "@/lib/types";
import { uuid } from "@/lib/validation";
import { useAuthStore } from "@/stores/auth-store";

const assignSchema = z.object({
  classId: uuid("lớp"),
});
type AssignValues = z.infer<typeof assignSchema>;

export default function StudentDetailPage() {
  const id = String(useParams<{ id: string }>().id);
  const student = useStudent(id);
  const receivables = useStudentReceivables(id);
  const ledger = useStudentLedger(id);
  const credits = useStudentCredits(id);
  const currentYear = useCurrentAcademicYear(student.data?.schoolId);
  const semesters = useSemesters({
    limit: 200,
    academicYearId: currentYear.data?.id,
    sortBy: "startDate",
    sortOrder: "ASC",
  });
  const classes = useClasses(
    {
      limit: 200,
      schoolId: student.data?.schoolId,
      academicYearId: currentYear.data?.id,
      sortBy: "name",
      sortOrder: "ASC",
    },
    Boolean(student.data?.schoolId && currentYear.data),
  );
  const role = useAuthStore((state) => state.user?.role);
  if (student.isLoading) return <Skeleton className="h-[600px] w-full" />;
  if (!student.data)
    return <p className="text-rose-600">Không tìm thấy học sinh.</p>;
  const assignFields: FormFieldConfig<AssignValues>[] = [
    {
      name: "classId",
      label: "Lớp học",
      type: "select",
      required: true,
      options:
        classes.data?.data.map((item) => ({
          value: item.id,
          label: `${item.name} · Khối ${item.grade ?? "—"}`,
        })) ?? [],
    },
  ];
  return (
    <>
      <PageHeader
        eyebrow={student.data.studentCode}
        title={student.data.fullName}
        description="Hồ sơ học sinh, công nợ và sổ kế toán chi tiết."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/students">
                <ArrowLeft />
                Danh sách
              </Link>
            </Button>
            {can(role, PERMISSIONS.studentWrite) && (
              <>
                <CurrentAcademicYearBadge
                  name={currentYear.data?.name}
                  loading={currentYear.isLoading}
                  error={currentYear.error}
                />
                <EntityFormDialog
                  title="Xếp lớp học sinh"
                  description={`Năm học hiện tại: ${currentYear.data?.name ?? "Đang tải…"}. Mỗi học sinh chỉ có một lớp đang hoạt động.`}
                  trigger={
                    <Button variant="outline" disabled={!currentYear.data}>
                      <UserRoundPlus />
                      Xếp lớp
                    </Button>
                  }
                  schema={assignSchema}
                  fields={assignFields}
                  defaultValues={{ classId: "" }}
                  successMessage="Đã xếp lớp học sinh"
                  queryKey={queryKeys.students}
                  onSubmit={(values) => {
                    if (!currentYear.data)
                      return Promise.reject(
                        new Error("Chưa xác định được năm học hiện tại"),
                      );
                    return studentsApi.assignClass({
                      studentId: id,
                      ...values,
                      academicYearId: currentYear.data.id,
                    } as AssignStudentPayload);
                  }}
                />
              </>
            )}
            {can(role, PERMISSIONS.collect) && (
              <CreatePaymentOrderDialog
                studentId={id}
                receivables={receivables.data ?? []}
              />
            )}
          </>
        }
      />
      <Tabs defaultValue="profile">
        <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
          <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
          <TabsTrigger value="receivables">Công nợ</TabsTrigger>
          <TabsTrigger value="ledger">Sổ công nợ</TabsTrigger>
          <TabsTrigger value="credits">Số dư có</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cơ bản</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-5 sm:grid-cols-2">
                {[
                  ["Ngày sinh", formatDate(student.data.dateOfBirth), Calendar],
                  [
                    "Mã định danh",
                    student.data.identifierCode || "—",
                    Building2,
                  ],
                  ["Điện thoại", student.data.phone || "—", Phone],
                  ["Địa chỉ", student.data.address || "—", MapPin],
                ].map(([label, value, Icon]) => (
                  <div key={String(label)} className="flex gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                      <Icon className="size-4" />
                    </span>
                    <div>
                      <p className="text-xs font-medium text-slate-400">
                        {String(label)}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {String(value)}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Liên hệ phụ huynh</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="font-semibold text-slate-900">
                  {student.data.parentName || "Chưa cập nhật"}
                </p>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Phone className="size-4" />
                  {student.data.parentPhone || "—"}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Mail className="size-4" />
                  {student.data.parentEmail || "—"}
                </div>
                <StatusBadge status={student.data.status} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="receivables">
          {receivables.isLoading ? (
            <Card>
              <CardContent className="pt-5">
                <Skeleton className="h-64" />
              </CardContent>
            </Card>
          ) : !receivables.data?.length ? (
            <Card>
              <CardContent className="pt-5">
                <Empty message="Học sinh chưa phát sinh công nợ." />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {groupReceivables(receivables.data).map((group) => {
                const plan = group.rows[0].feePlan;
                const payableRows = group.rows.filter(isPayable);
                const isSemesterPlan = Boolean(
                  plan && plan.billingType !== "ONE_TIME",
                );

                return (
                  <Card key={group.feePlanId}>
                    <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <CardTitle>
                          {plan?.name ??
                            group.rows[0].description ??
                            "Khoản thu"}
                        </CardTitle>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <BillingTypeBadge billingType={plan?.billingType} />
                          {plan?.code && (
                            <span className="font-mono text-xs font-bold text-teal-700">
                              {plan.code}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-xs font-medium text-slate-400">
                          Tổng còn nợ
                        </p>
                        <p className="mt-1 font-display text-lg font-bold text-slate-950">
                          {formatCurrency(sumOutstanding(group.rows))}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Kỳ thu</TableHead>
                            <TableHead>Mã công nợ</TableHead>
                            <TableHead>Phải thu</TableHead>
                            <TableHead>Đã thu</TableHead>
                            <TableHead>Còn nợ</TableHead>
                            <TableHead>Trạng thái</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {group.rows.map((row) => (
                            <TableRow key={row.id}>
                              <TableCell className="font-medium text-slate-700">
                                {getSemesterLabel(
                                  row,
                                  semesters.data?.data ?? [],
                                )}
                              </TableCell>
                              <TableCell>
                                <Link
                                  href={`/receivables/${row.id}`}
                                  className="font-mono text-xs font-bold text-teal-700 hover:underline"
                                >
                                  {row.receivableCode}
                                </Link>
                              </TableCell>
                              <TableCell>
                                {formatCurrency(row.amountDue)}
                              </TableCell>
                              <TableCell>
                                {formatCurrency(row.amountPaid)}
                              </TableCell>
                              <TableCell className="font-semibold text-slate-900">
                                {formatCurrency(row.amountOutstanding)}
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={row.status} />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {can(role, PERMISSIONS.collect) &&
                        isSemesterPlan &&
                        payableRows.length > 0 && (
                          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                            <span className="mr-1 text-xs font-semibold text-slate-500">
                              Thanh toán nhanh:
                            </span>
                            {payableRows.map((row) => (
                              <CreatePaymentOrderDialog
                                key={row.id}
                                studentId={id}
                                receivables={receivables.data}
                                initialReceivableIds={[row.id]}
                                trigger={
                                  <Button variant="outline" size="sm">
                                    Đóng{" "}
                                    {getSemesterShortLabel(
                                      row,
                                      semesters.data?.data ?? [],
                                    )}
                                  </Button>
                                }
                              />
                            ))}
                            {payableRows.length >= 2 && (
                              <CreatePaymentOrderDialog
                                studentId={id}
                                receivables={receivables.data}
                                initialReceivableIds={payableRows.map(
                                  (row) => row.id,
                                )}
                                trigger={<Button size="sm">Đóng cả năm</Button>}
                              />
                            )}
                          </div>
                        )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
        <TabsContent value="ledger">
          <Card>
            <CardHeader>
              <CardTitle>Sổ công nợ</CardTitle>
            </CardHeader>
            <CardContent>
              {ledger.isLoading ? (
                <Skeleton className="h-64" />
              ) : !ledger.data?.entries.length ? (
                <Empty message="Chưa có bút toán nào." />
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ngày</TableHead>
                        <TableHead>Nội dung</TableHead>
                        <TableHead className="text-right">Nợ</TableHead>
                        <TableHead className="text-right">Có</TableHead>
                        <TableHead className="text-right">Số dư</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ledger.data.entries.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{formatDate(row.postingDate)}</TableCell>
                          <TableCell>
                            <p className="font-medium text-slate-900">
                              {row.description}
                            </p>
                            <p className="text-xs text-slate-400">
                              {row.entryType}
                            </p>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(row.debitAmount)}
                          </TableCell>
                          <TableCell className="text-right text-emerald-700">
                            {formatCurrency(row.creditAmount)}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(row.balance)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4 flex justify-end rounded-xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">
                      Số dư cuối kỳ{" "}
                      <span className="ml-3 font-display text-xl font-bold text-slate-950">
                        {formatCurrency(ledger.data.closingBalance)}
                      </span>
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="credits">
          <Card>
            <CardHeader>
              <CardTitle>Số dư có khả dụng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-5 rounded-2xl bg-teal-700 p-5 text-white">
                <p className="text-sm text-teal-100/70">Tổng số dư có</p>
                <p className="mt-2 font-display text-3xl font-bold">
                  {formatCurrency(credits.data?.availableBalance)}
                </p>
              </div>
              {credits.isLoading ? (
                <Skeleton className="h-40" />
              ) : !credits.data?.credits.length ? (
                <Empty message="Học sinh chưa có khoản thanh toán thừa." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nguồn giao dịch</TableHead>
                      <TableHead>Số tiền gốc</TableHead>
                      <TableHead>Còn lại</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {credits.data.credits.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-mono text-xs">
                          {row.sourcePaymentTransactionId}
                        </TableCell>
                        <TableCell>{formatCurrency(row.amount)}</TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(row.remainingAmount)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={row.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

function groupReceivables(rows: Receivable[]) {
  const groups = new Map<string, Receivable[]>();
  for (const row of rows) {
    const current = groups.get(row.feePlanId) ?? [];
    current.push(row);
    groups.set(row.feePlanId, current);
  }
  return [...groups.entries()].map(([feePlanId, groupedRows]) => ({
    feePlanId,
    rows: groupedRows,
  }));
}

function getSemesterLabel(row: Receivable, semesters: Semester[]) {
  if (!row.semesterId) return "Thu một lần";
  const semester = semesters.find((item) => item.id === row.semesterId);
  if (semester) return semester.name;
  return row.description?.match(/Học kỳ\s+\d+/i)?.[0] ?? "Theo học kỳ";
}

function getSemesterShortLabel(row: Receivable, semesters: Semester[]) {
  return getSemesterLabel(row, semesters).replace(/Học kỳ\s*/i, "HK");
}

function sumOutstanding(rows: Receivable[]) {
  return rows
    .reduce((sum, row) => sum.plus(row.amountOutstanding), new Decimal(0))
    .toFixed(2);
}

function isPayable(row: Receivable) {
  if (["PAID", "CANCELLED"].includes(row.status)) return false;
  try {
    return new Decimal(row.amountOutstanding).isPositive();
  } catch {
    return false;
  }
}

function BillingTypeBadge({
  billingType,
}: {
  billingType?: FeePlan["billingType"];
}) {
  if (billingType === "MONTHLY") {
    return <Badge variant="info">Theo tháng (chia học kỳ)</Badge>;
  }
  if (billingType === "ONE_TIME") {
    return <Badge variant="secondary">Thu một lần</Badge>;
  }
  return <Badge variant="warning">Tùy chỉnh</Badge>;
}

function Empty({ message }: { message: string }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center text-center">
      <WalletCards className="mb-3 size-9 text-slate-300" />
      <p className="text-sm font-medium text-slate-500">{message}</p>
    </div>
  );
}
