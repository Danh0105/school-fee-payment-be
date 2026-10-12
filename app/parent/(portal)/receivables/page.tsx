"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Decimal from "decimal.js";
import {
  CalendarDays,
  CreditCard,
  GraduationCap,
  School,
  WalletCards,
} from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { parentPortalApi } from "@/features/parent-portal/api";
import { ParentError } from "@/features/parent-portal/components/parent-error";
import {
  useParentMe,
  useParentReceivables,
} from "@/features/parent-portal/hooks";
import { getErrorMessage } from "@/lib/error-messages";
import { formatCurrency, formatDate } from "@/lib/format";
import type { FeePlan, Receivable } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";
import { useParentSessionStore } from "@/stores/parent-session-store";

export default function ParentReceivablesPage() {
  const router = useRouter();
  const confirmationRef = useRef<HTMLDivElement>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const storedStudent = useParentSessionStore((state) => state.student);
  const setStudent = useParentSessionStore((state) => state.setStudent);
  const me = useParentMe();
  const receivables = useParentReceivables();

  useEffect(() => {
    if (me.data) setStudent(me.data);
  }, [me.data, setStudent]);

  const student = me.data
    ? {
        ...storedStudent,
        ...me.data,
        school: me.data.school ?? storedStudent?.school,
      }
    : storedStudent;
  const groups = useMemo(
    () => groupReceivables(receivables.data ?? []),
    [receivables.data],
  );
  const selectedRows = (receivables.data ?? []).filter((row) =>
    selectedIds.has(row.id),
  );
  const selectedTotal = sumOutstanding(selectedRows);
  const createOrder = useMutation({
    mutationFn: () =>
      parentPortalApi.createPaymentOrder({
        items: selectedRows.map((row) => ({ receivableId: row.id })),
        paymentMethod: "VIETINBANK",
      }),
    onSuccess: (order) => router.push(`/parent/payment-orders/${order.id}`),
  });

  const toggle = (row: Receivable) => {
    if (!isPayable(row)) return;
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(row.id)) next.delete(row.id);
      else next.add(row.id);
      return next;
    });
  };

  const selectAndReview = (ids: string[]) => {
    setSelectedIds(new Set(ids));
    window.requestAnimationFrame(() =>
      confirmationRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      }),
    );
  };

  if (me.isLoading || receivables.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-36 rounded-3xl" />
        <Skeleton className="h-72 rounded-3xl" />
      </div>
    );
  }

  if (me.error || receivables.error) {
    return (
      <ParentError
        error={me.error ?? receivables.error}
        onRetry={() => {
          void me.refetch();
          void receivables.refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[28px] bg-[#075f3b] p-6 text-white shadow-[0_22px_50px_-32px_rgba(5,76,59,0.8)] sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-100/80">
          Công nợ học sinh
        </p>
        <h1 className="mt-2 font-display text-2xl font-extrabold sm:text-3xl">
          {student?.fullName ?? "Học sinh"}
        </h1>
        <div className="mt-5 grid gap-2 text-sm text-emerald-50 sm:grid-cols-2">
          <p className="flex items-center gap-2">
            <School className="size-4 text-lime-300" />
            {student?.school?.name ?? "Thông tin trường học"}
          </p>
          <p className="flex items-center gap-2 sm:justify-end">
            <GraduationCap className="size-4 text-lime-300" />
            Mã học sinh: {student?.studentCode ?? "—"}
          </p>
        </div>
      </section>

      <div className="flex items-end justify-between gap-4 px-1">
        <div>
          <h2 className="font-display text-xl font-extrabold text-[#123f36]">
            Các khoản cần thanh toán
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Chọn một học kỳ hoặc nhiều khoản để thanh toán cùng lúc.
          </p>
        </div>
        <Badge variant="secondary">{groups.length} khoản thu</Badge>
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-56 flex-col items-center justify-center text-center">
            <WalletCards className="size-10 text-emerald-700/30" />
            <p className="mt-4 font-bold text-slate-800">
              Chưa có công nợ cần hiển thị
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Các khoản thu mới sẽ xuất hiện tại đây.
            </p>
          </CardContent>
        </Card>
      ) : (
        groups.map((group) => {
          const plan = group.rows[0].feePlan;
          const payableRows = group.rows.filter(isPayable);
          const isSemesterPlan = group.rows.some((row) => row.semesterId);

          return (
            <Card key={group.feePlanId}>
              <CardHeader className="gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {plan?.name ??
                      group.rows[0].description ??
                      "Khoản phải thu"}
                  </CardTitle>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <BillingTypeBadge billingType={plan?.billingType} />
                    {plan?.code && (
                      <span className="font-mono text-xs font-bold text-emerald-700">
                        {plan.code}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs font-medium text-slate-400">
                    Tổng còn nợ
                  </p>
                  <p className="mt-1 font-display text-xl font-extrabold text-slate-950">
                    {formatCurrency(sumOutstanding(group.rows))}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-5">
                {group.rows.map((row) => {
                  const payable = isPayable(row);
                  const checked = selectedIds.has(row.id);
                  return (
                    <label
                      key={row.id}
                      className={`flex items-start gap-3 rounded-2xl border p-4 transition ${
                        payable
                          ? "cursor-pointer border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                          : "cursor-not-allowed border-slate-100 bg-slate-50 opacity-70"
                      }`}
                    >
                      <Checkbox
                        checked={checked}
                        disabled={!payable}
                        onCheckedChange={() => toggle(row)}
                        aria-label={`Chọn ${getSemesterLabel(row)}`}
                        className="mt-1 size-5"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-bold text-slate-900">
                            {getSemesterLabel(row)}
                          </p>
                          <StatusBadge status={row.status} />
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                          {row.receivableCode}
                          {row.dueDate && (
                            <> · Hạn thu {formatDate(row.dueDate)}</>
                          )}
                        </p>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <span className="text-sm text-slate-500">
                            Còn phải thanh toán
                          </span>
                          <span className="font-display text-lg font-extrabold text-emerald-800">
                            {formatCurrency(row.amountOutstanding)}
                          </span>
                        </div>
                      </div>
                    </label>
                  );
                })}

                {isSemesterPlan && payableRows.length > 0 && (
                  <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                    {payableRows.map((row) => (
                      <Button
                        key={row.id}
                        variant="outline"
                        size="sm"
                        onClick={() => selectAndReview([row.id])}
                      >
                        Đóng {getSemesterShortLabel(row)}
                      </Button>
                    ))}
                    {payableRows.length >= 2 && (
                      <Button
                        size="sm"
                        onClick={() =>
                          selectAndReview(payableRows.map((row) => row.id))
                        }
                      >
                        Đóng cả năm
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      )}

      <div ref={confirmationRef} className="scroll-mt-24">
        <Card className="border-emerald-700/20">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Đã chọn {selectedRows.length} công nợ
                </p>
                <p className="mt-1 font-display text-3xl font-extrabold text-[#075f3b]">
                  {formatCurrency(selectedTotal)}
                </p>
              </div>
              <Button
                size="lg"
                disabled={selectedRows.length === 0 || createOrder.isPending}
                onClick={() => createOrder.mutate()}
              >
                <CreditCard />
                {createOrder.isPending
                  ? "Đang tạo yêu cầu…"
                  : "Tạo yêu cầu thanh toán"}
              </Button>
            </div>
            {createOrder.error && (
              <p
                className="mt-3 text-sm font-medium text-rose-600"
                role="alert"
              >
                {getErrorMessage(createOrder.error)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="flex items-center justify-center gap-2 text-center text-xs text-slate-400">
        <CalendarDays className="size-3.5" /> Số tiền được lấy trực tiếp từ công
        nợ hiện tại của học sinh.
      </p>
    </div>
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

function getSemesterLabel(row: Receivable) {
  if (!row.semesterId) return "Thu một lần";
  return row.description?.match(/Học kỳ\s+\d+/i)?.[0] ?? "Theo học kỳ";
}

function getSemesterShortLabel(row: Receivable) {
  return getSemesterLabel(row).replace(/Học kỳ\s*/i, "HK");
}

function isPayable(row: Receivable) {
  if (["PAID", "CANCELLED"].includes(row.status)) return false;
  try {
    return new Decimal(row.amountOutstanding).isPositive();
  } catch {
    return false;
  }
}

function sumOutstanding(rows: Receivable[]) {
  try {
    return rows
      .reduce((sum, row) => sum.plus(row.amountOutstanding), new Decimal(0))
      .toFixed(2);
  } catch {
    return "0";
  }
}

function BillingTypeBadge({
  billingType,
}: {
  billingType?: FeePlan["billingType"];
}) {
  if (billingType === "MONTHLY") {
    return <Badge variant="info">Theo tháng · chia học kỳ</Badge>;
  }
  if (billingType === "ONE_TIME") {
    return <Badge variant="secondary">Thu một lần</Badge>;
  }
  return <Badge variant="warning">Theo học kỳ</Badge>;
}
