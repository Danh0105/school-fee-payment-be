"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
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
import { ReceiptEInvoiceCard } from "@/features/einvoices/components/receipt-einvoice-card";
import { CancelReceiptDialog } from "@/features/receipts/components/cancel-receipt-dialog";
import { useReceipt } from "@/features/receipts/hooks";
import { formatCurrency, formatDate } from "@/lib/format";
import { can, PERMISSIONS } from "@/lib/permissions";
import { useAuthStore } from "@/stores/auth-store";

export default function ReceiptDetailPage() {
  const id = String(useParams<{ id: string }>().id);
  const receipt = useReceipt(id);
  const role = useAuthStore((state) => state.user?.role);
  if (receipt.isLoading) return <Skeleton className="h-[650px] w-full" />;
  if (!receipt.data)
    return <p className="text-rose-600">Không tìm thấy phiếu thu.</p>;
  const data = receipt.data;
  return (
    <>
      <div className="print-hidden">
        <PageHeader
          eyebrow="Chi tiết chứng từ"
          title={data.receiptNumber}
          description={`Phát hành ${formatDate(data.issuedAt, true)}`}
          actions={
            <>
              <Button variant="outline" asChild>
                <Link href="/receipts">
                  <ArrowLeft />
                  Danh sách
                </Link>
              </Button>
              <Button variant="outline" onClick={() => window.print()}>
                <Printer />
                In phiếu thu
              </Button>
              {data.status === "ISSUED" &&
                can(role, PERMISSIONS.accounting) && (
                  <CancelReceiptDialog receiptId={id} />
                )}
            </>
          }
        />
        <ReceiptEInvoiceCard receipt={data} />
      </div>
      <Card className="print-sheet mx-auto max-w-4xl">
        <CardContent className="p-7 sm:p-10">
          <div className="border-b-2 border-[#078247] pb-6 text-center">
            <Image
              src="/ichi-skill-logo.png"
              alt="Logo ICHI SKILL"
              width={68}
              height={68}
              className="mx-auto mb-3 rounded-full"
            />
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#078247]">
              ICHI SKILL · Chứng từ thu
            </p>
            <h2 className="mt-3 font-display text-3xl font-black uppercase text-slate-950">
              Phiếu thu
            </h2>
            <p className="mt-2 font-mono text-sm">Số: {data.receiptNumber}</p>
          </div>
          <div className="grid gap-5 border-b border-slate-200 py-6 sm:grid-cols-2">
            <Info label="Học sinh" value={data.student?.fullName ?? "—"} />
            <Info
              label="Mã học sinh"
              value={data.student?.studentCode ?? "—"}
            />
            <Info
              label="Người nộp"
              value={data.payerName ?? data.student?.parentName ?? "—"}
            />
            <Info
              label="Điện thoại"
              value={data.payerPhone ?? data.student?.parentPhone ?? "—"}
            />
            <Info label="Hình thức" value={data.paymentMethod} />
            <Info label="Ngày thu" value={formatDate(data.issuedAt, true)} />
          </div>
          <div className="py-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">STT</TableHead>
                  <TableHead>Nội dung thu</TableHead>
                  <TableHead className="text-right">Số tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items?.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium text-slate-900">
                      {item.description}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(item.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 flex justify-end">
              <div className="min-w-72 rounded-xl bg-[linear-gradient(145deg,#054c3b,#078247)] px-5 py-4 text-white">
                <div className="flex items-center justify-between gap-8">
                  <span className="text-sm text-slate-300">Tổng cộng</span>
                  <span className="font-display text-xl font-bold">
                    {formatCurrency(data.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {data.description && (
            <p className="text-sm text-slate-500">
              Nội dung: {data.description}
            </p>
          )}
          <div className="mt-12 grid grid-cols-2 gap-12 text-center">
            <div>
              <p className="font-semibold">Người nộp tiền</p>
              <p className="mt-1 text-xs text-slate-400">Ký, ghi rõ họ tên</p>
            </div>
            <div>
              <p className="font-semibold">Người lập phiếu</p>
              <p className="mt-1 text-xs text-slate-400">Ký, ghi rõ họ tên</p>
            </div>
          </div>
          {data.status === "CANCELLED" && (
            <div className="mt-10 rounded-xl border-2 border-rose-300 bg-rose-50 p-4 text-center text-rose-800">
              <StatusBadge status={data.status} />
              <p className="mt-2 text-sm font-medium">
                Lý do: {data.cancelReason}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  );
}
