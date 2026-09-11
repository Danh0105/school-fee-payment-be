"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import Decimal from "decimal.js";
import {
  ArrowLeft,
  MinusCircle,
  Percent,
  PlusCircle,
  QrCode,
} from "lucide-react";
import { z } from "zod";
import {
  EntityFormDialog,
  type FormFieldConfig,
} from "@/components/entity-form-dialog";
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
import { CreatePaymentOrderDialog } from "@/features/payment-orders/components/create-payment-order-dialog";
import { receivablesApi } from "@/features/receivables/api";
import {
  useReceivable,
  useReceivableAdjustments,
  useReceivableDiscounts,
  useStudentReceivables,
} from "@/features/receivables/hooks";
import { formatCurrency, formatDate } from "@/lib/format";
import { can, PERMISSIONS } from "@/lib/permissions";
import { queryKeys } from "@/lib/query-keys";
import { moneyString, requiredText } from "@/lib/validation";
import { useAuthStore } from "@/stores/auth-store";

const discountSchema = z
  .object({
    type: z.enum(["FIXED_AMOUNT", "PERCENTAGE"]),
    value: moneyString,
    reason: requiredText("Lý do").min(3, "Lý do cần ít nhất 3 ký tự"),
  })
  .refine(
    (data) => data.type !== "PERCENTAGE" || new Decimal(data.value).lte(100),
    { path: ["value"], message: "Tỷ lệ miễn giảm không được vượt quá 100%" },
  );
const adjustmentSchema = z.object({
  type: z.enum(["INCREASE", "DECREASE"]),
  amount: moneyString,
  reason: requiredText("Lý do").min(3, "Lý do cần ít nhất 3 ký tự"),
});
type DiscountValues = z.infer<typeof discountSchema>;
type AdjustmentValues = z.infer<typeof adjustmentSchema>;

export default function ReceivableDetailPage() {
  const id = String(useParams<{ id: string }>().id);
  const receivable = useReceivable(id);
  const discounts = useReceivableDiscounts(id);
  const adjustments = useReceivableAdjustments(id);
  const studentId = receivable.data?.studentId ?? "";
  const studentReceivables = useStudentReceivables(studentId);
  const role = useAuthStore((state) => state.user?.role);
  if (receivable.isLoading) return <Skeleton className="h-[600px] w-full" />;
  if (!receivable.data)
    return <p className="text-rose-600">Không tìm thấy khoản công nợ.</p>;
  const row = receivable.data;
  const discountFields: FormFieldConfig<DiscountValues>[] = [
    {
      name: "type",
      label: "Loại miễn giảm",
      type: "select",
      required: true,
      options: [
        { value: "FIXED_AMOUNT", label: "Số tiền cố định" },
        { value: "PERCENTAGE", label: "Theo tỷ lệ (%)" },
      ],
    },
    { name: "value", label: "Giá trị", type: "number", required: true },
    {
      name: "reason",
      label: "Lý do",
      type: "textarea",
      required: true,
      hint: "Nội dung này được lưu vĩnh viễn trong chứng từ.",
    },
  ];
  const adjustmentFields: FormFieldConfig<AdjustmentValues>[] = [
    {
      name: "type",
      label: "Loại điều chỉnh",
      type: "select",
      required: true,
      options: [
        { value: "INCREASE", label: "Tăng công nợ" },
        { value: "DECREASE", label: "Giảm công nợ" },
      ],
    },
    { name: "amount", label: "Số tiền", type: "number", required: true },
    {
      name: "reason",
      label: "Lý do",
      type: "textarea",
      required: true,
      hint: "Nội dung này được lưu vĩnh viễn trong chứng từ.",
    },
  ];
  return (
    <>
      <PageHeader
        eyebrow={row.receivableCode}
        title={row.feePlan?.name ?? row.description ?? "Chi tiết công nợ"}
        description={`${row.student?.fullName ?? "Học sinh"} · Hạn thu ${formatDate(row.dueDate)}`}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/receivables">
                <ArrowLeft />
                Danh sách
              </Link>
            </Button>
            {can(role, PERMISSIONS.feeWrite) && (
              <EntityFormDialog
                title="Áp dụng miễn giảm"
                description="Giá trị miễn giảm làm giảm trực tiếp số phải thu của học sinh."
                trigger={
                  <Button variant="outline">
                    <Percent />
                    Miễn giảm
                  </Button>
                }
                schema={discountSchema}
                fields={discountFields}
                defaultValues={{ type: "FIXED_AMOUNT", value: "", reason: "" }}
                successMessage="Đã áp dụng miễn giảm"
                queryKey={queryKeys.receivables}
                additionalQueryKeys={[
                  [...queryKeys.students, studentId, "ledger"],
                ]}
                onSubmit={(values) => receivablesApi.createDiscount(id, values)}
              />
            )}
            {can(role, PERMISSIONS.feeWrite) && (
              <EntityFormDialog
                title="Điều chỉnh công nợ"
                description="Điều chỉnh tạo bút toán tăng hoặc giảm và được lưu vào sổ công nợ."
                trigger={
                  <Button variant="outline">
                    <PlusCircle />
                    Điều chỉnh
                  </Button>
                }
                schema={adjustmentSchema}
                fields={adjustmentFields}
                defaultValues={{ type: "INCREASE", amount: "", reason: "" }}
                successMessage="Đã điều chỉnh công nợ"
                queryKey={queryKeys.receivables}
                additionalQueryKeys={[
                  [...queryKeys.students, studentId, "ledger"],
                ]}
                onSubmit={(values) =>
                  receivablesApi.createAdjustment(id, values)
                }
              />
            )}
            {can(role, PERMISSIONS.collect) && (
              <CreatePaymentOrderDialog
                studentId={studentId}
                receivables={studentReceivables.data ?? [row]}
                initialReceivableId={id}
                trigger={
                  <Button>
                    <QrCode />
                    Thanh toán
                  </Button>
                }
              />
            )}
          </>
        }
      />
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <AmountCard label="Nguyên giá" value={row.originalAmount} />
        <AmountCard label="Miễn giảm" value={row.discountAmount} tone="green" />
        <AmountCard label="Điều chỉnh" value={row.adjustmentAmount} />
        <AmountCard label="Phải thu" value={row.amountDue} />
        <AmountCard label="Đã thu" value={row.amountPaid} tone="green" />
        <AmountCard label="Còn nợ" value={row.amountOutstanding} tone="red" />
      </div>
      <div className="mb-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin khoản phải thu</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Info label="Mã công nợ" value={row.receivableCode} />
            <Info
              label="Trạng thái"
              value={<StatusBadge status={row.status} />}
            />
            <Info label="Đơn giá" value={formatCurrency(row.unitPrice)} />
            <Info label="Số lượng" value={row.quantity} />
            <Info label="Ngày phát sinh" value={formatDate(row.createdAt)} />
            <Info label="Hạn thu" value={formatDate(row.dueDate)} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Học sinh</CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href={`/students/${row.studentId}`}
              className="block rounded-xl bg-slate-50 p-4 transition hover:bg-teal-50"
            >
              <p className="font-display text-lg font-bold text-slate-950">
                {row.student?.fullName}
              </p>
              <p className="mt-1 font-mono text-xs text-teal-700">
                {row.student?.studentCode}
              </p>
            </Link>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <History
          title="Lịch sử miễn giảm"
          loading={discounts.isLoading}
          empty="Chưa có miễn giảm"
          rows={
            discounts.data?.map((item) => ({
              id: item.id,
              title:
                item.type === "PERCENTAGE"
                  ? `${item.value}%`
                  : formatCurrency(item.value),
              amount: `-${formatCurrency(item.amount)}`,
              reason: item.reason,
              date: item.createdAt,
            })) ?? []
          }
        />
        <History
          title="Lịch sử điều chỉnh"
          loading={adjustments.isLoading}
          empty="Chưa có điều chỉnh"
          rows={
            adjustments.data?.map((item) => ({
              id: item.id,
              title: item.adjustmentCode,
              amount: `${item.type === "INCREASE" ? "+" : "-"}${formatCurrency(item.amount)}`,
              reason: item.reason,
              date: item.createdAt,
            })) ?? []
          }
        />
      </div>
    </>
  );
}

function AmountCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "green" | "red";
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p
          className={`mt-2 font-display text-lg font-bold ${tone === "green" ? "text-emerald-700" : tone === "red" ? "text-rose-700" : "text-slate-950"}`}
        >
          {formatCurrency(value)}
        </p>
      </CardContent>
    </Card>
  );
}
function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <div className="mt-1 text-sm font-semibold text-slate-800">{value}</div>
    </div>
  );
}
function History({
  title,
  rows,
  loading,
  empty,
}: {
  title: string;
  rows: {
    id: string;
    title: string;
    amount: string;
    reason: string;
    date: string;
  }[];
  loading: boolean;
  empty: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-40" />
        ) : rows.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center text-sm text-slate-400">
            <MinusCircle className="mb-2 size-7" />
            {empty}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Chứng từ</TableHead>
                <TableHead>Lý do</TableHead>
                <TableHead className="text-right">Giá trị</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <p className="font-semibold text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-400">
                      {formatDate(item.date)}
                    </p>
                  </TableCell>
                  <TableCell>{item.reason}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {item.amount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
