"use client";

/* eslint-disable @next/next/no-img-element -- backend explicitly returns a ready-to-render qrUrl. */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Copy,
  QrCode,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
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
import { ParentError } from "@/features/parent-portal/components/parent-error";
import {
  useParentPaymentOrder,
  useParentPaymentOrderQr,
} from "@/features/parent-portal/hooks";
import { formatCurrency, formatDate } from "@/lib/format";

export default function ParentPaymentOrderPage() {
  const id = String(useParams<{ id: string }>().id);
  const order = useParentPaymentOrder(id);
  const qr = useParentPaymentOrderQr(id);
  const expiresAt = qr.data?.expiresAt ?? order.data?.expiresAt;
  const status = qr.data?.status ?? order.data?.status ?? "PENDING";
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const update = () =>
      setRemaining(
        expiresAt ? Math.max(0, new Date(expiresAt).getTime() - Date.now()) : 0,
      );
    update();
    const timer = window.setInterval(update, 1_000);
    return () => window.clearInterval(timer);
  }, [expiresAt]);

  if (order.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 rounded-3xl" />
        <Skeleton className="h-[460px] rounded-3xl" />
      </div>
    );
  }

  if (order.error || !order.data) {
    return (
      <ParentError
        error={order.error ?? new Error("Không tìm thấy yêu cầu thanh toán")}
        onRetry={() => void order.refetch()}
      />
    );
  }

  const data = order.data;
  const minutes = Math.floor(remaining / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1_000);
  const copy = (value: string) =>
    navigator.clipboard
      .writeText(value)
      .then(() => toast.success("Đã sao chép"));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/parent/receivables">
            <ArrowLeft /> Công nợ
          </Link>
        </Button>
        <p className="text-xs font-medium text-slate-500">
          Tạo lúc {formatDate(data.createdAt, true)}
        </p>
      </div>

      {status === "PAID" && (
        <div className="flex items-start gap-3 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
          <CheckCircle2 className="mt-0.5 size-7 shrink-0 text-emerald-700" />
          <div>
            <p className="font-display text-lg font-extrabold">
              Thanh toán thành công
            </p>
            <p className="mt-1 text-sm leading-6 text-emerald-700">
              Hệ thống đã ghi nhận giao dịch và cập nhật công nợ học sinh.
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Mã yêu cầu thanh toán
              </p>
              <CardTitle className="mt-2 font-mono text-xl text-emerald-800">
                {data.orderCode}
              </CardTitle>
            </div>
            <StatusBadge status={status} />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-7 md:grid-cols-[0.95fr_1.05fr]">
            <div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <div className="flex min-h-72 items-center justify-center rounded-2xl bg-white">
                  {qr.isLoading ? (
                    <Skeleton className="size-64 rounded-2xl" />
                  ) : qr.data?.qrUrl ? (
                    <img
                      src={qr.data.qrUrl}
                      alt={`QR thanh toán ${data.orderCode}`}
                      className="aspect-square w-full max-w-72 rounded-2xl object-contain p-2"
                    />
                  ) : (
                    <div className="px-6 text-center">
                      <QrCode className="mx-auto size-12 text-slate-300" />
                      <p className="mt-3 text-sm leading-6 text-slate-500">
                        Chưa có mã QR. Vui lòng thử tải lại sau ít phút.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-slate-600">
                <Clock3 className="size-4 text-amber-600" />
                {status === "PAID"
                  ? "Đã hoàn tất"
                  : remaining > 0
                    ? `Còn hiệu lực ${minutes}:${String(seconds).padStart(2, "0")}`
                    : "Yêu cầu đã hết thời gian thanh toán"}
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-3xl bg-[#075f3b] p-6 text-white">
                <p className="text-sm font-medium text-emerald-100/80">
                  Tổng tiền thanh toán
                </p>
                <p className="mt-2 font-display text-4xl font-extrabold">
                  {formatCurrency(data.requestedAmount)}
                </p>
              </div>
              <div className="space-y-4 rounded-3xl border border-slate-200 p-5">
                <Info label="Ngân hàng" value={data.bankCode || "—"} />
                <Info
                  label="Số tài khoản"
                  value={data.bankAccountNumber || "—"}
                  copy={
                    data.bankAccountNumber
                      ? () => copy(data.bankAccountNumber!)
                      : undefined
                  }
                />
                <Info
                  label="Nội dung chuyển khoản"
                  value={data.transferContent}
                  copy={() => copy(data.transferContent)}
                />
              </div>
              <Button
                variant="outline"
                className="w-full"
                disabled={order.isFetching || qr.isFetching}
                onClick={() => {
                  void order.refetch();
                  void qr.refetch();
                }}
              >
                <RefreshCw
                  className={
                    order.isFetching || qr.isFetching ? "animate-spin" : ""
                  }
                />
                Kiểm tra trạng thái
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Chi tiết các khoản thanh toán</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Khoản công nợ</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <p className="font-medium text-slate-900">
                      {item.receivable?.description ??
                        item.receivable?.receivableCode ??
                        "Khoản phải thu"}
                    </p>
                    <p className="mt-1 font-mono text-xs text-slate-400">
                      {item.receivable?.receivableCode}
                    </p>
                  </TableCell>
                  <TableCell className="text-right font-bold text-slate-900">
                    {formatCurrency(item.requestedAmount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-center text-xs leading-5 text-slate-500">
        Trạng thái được tự động cập nhật mỗi 4 giây. Chỉ chuyển tiền đúng số
        tiền và nội dung hiển thị bên trên.
      </p>
    </div>
  );
}

function Info({
  label,
  value,
  copy,
}: {
  label: string;
  value: string;
  copy?: () => void;
}) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <div className="mt-1.5 flex items-center gap-2 break-all text-sm font-bold text-slate-800">
        <span>{value}</span>
        {copy && (
          <button
            type="button"
            onClick={copy}
            aria-label={`Sao chép ${label.toLowerCase()}`}
            className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <Copy className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
