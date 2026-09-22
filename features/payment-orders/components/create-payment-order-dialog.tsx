"use client";

import { useEffect, useMemo, useState } from "react";
import Decimal from "decimal.js";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { CreditCard, QrCode } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getErrorMessage } from "@/lib/error-messages";
import { formatCurrency } from "@/lib/format";
import type { Receivable } from "@/lib/types";
import { paymentOrdersApi } from "../api";

const itemSchema = z.object({
  receivableId: z.uuid(),
  amount: z
    .string()
    .regex(/^\d+(\.\d+)?$/, "Số tiền không hợp lệ")
    .refine((value) => new Decimal(value || 0).gt(0), "Số tiền phải lớn hơn 0"),
});
const schema = z.object({
  paymentMethod: z.enum(["VIETQR", "VIETINBANK", "CASH"]),
  items: z.array(itemSchema).min(1, "Chọn ít nhất một khoản công nợ"),
});
type Values = z.infer<typeof schema>;

export function CreatePaymentOrderDialog({
  studentId,
  receivables,
  initialReceivableId,
  initialReceivableIds,
  trigger,
}: {
  studentId: string;
  receivables: Receivable[];
  initialReceivableId?: string;
  initialReceivableIds?: string[];
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const eligible = useMemo(
    () =>
      receivables.filter(
        (item) =>
          !["PAID", "CANCELLED"].includes(item.status) &&
          new Decimal(item.amountOutstanding).gt(0),
      ),
    [receivables],
  );
  const initialSelectionKey =
    initialReceivableIds?.join("|") ?? initialReceivableId ?? "";
  const initiallySelectedIds = useMemo(
    () => new Set(initialSelectionKey.split("|").filter(Boolean)),
    [initialSelectionKey],
  );
  const initialItems = useMemo(
    () =>
      eligible
        .filter((item) => initiallySelectedIds.has(item.id))
        .map((item) => ({
          receivableId: item.id,
          amount: item.amountOutstanding,
        })),
    [eligible, initiallySelectedIds],
  );
  const hasInitialSelection = initiallySelectedIds.size > 0;
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      paymentMethod: "VIETQR",
      items: hasInitialSelection ? initialItems : [],
    },
  });
  const mutation = useMutation({
    mutationFn: paymentOrdersApi.create,
    onSuccess: (order) => {
      toast.success("Đã tạo yêu cầu thanh toán");
      setOpen(false);
      router.push(`/payment-orders/${order.id}`);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  useEffect(() => {
    if (open)
      reset({
        paymentMethod: "VIETQR",
        items: hasInitialSelection ? initialItems : [],
      });
  }, [open, hasInitialSelection, initialItems, reset]);
  const selected = useWatch({ control, name: "items" }) ?? [];
  const total = selected.reduce((sum, item) => {
    try {
      return sum.plus(item.amount || 0);
    } catch {
      return sum;
    }
  }, new Decimal(0));
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <QrCode />
            Tạo yêu cầu thanh toán
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tạo yêu cầu thanh toán</DialogTitle>
          <DialogDescription>
            Chọn các khoản cần thu và kiểm tra số tiền trước khi tạo mã QR.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((values) =>
            mutation.mutate({ studentId, ...values }),
          )}
        >
          <div className="mb-4">
            <p className="mb-2 text-sm font-semibold text-slate-700">
              Phương thức
            </p>
            <Controller
              name="paymentMethod"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VIETQR">Chuyển khoản VietQR</SelectItem>
                    <SelectItem value="VIETINBANK">
                      VietinBank (tài khoản định danh) — test
                    </SelectItem>
                    <SelectItem value="CASH">Thu tiền mặt</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="grid grid-cols-[32px_1fr_150px] gap-3 bg-slate-50 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <span />
              <span>Khoản công nợ</span>
              <span>Số tiền thu</span>
            </div>
            {eligible.length === 0 ? (
              <p className="p-8 text-center text-sm text-slate-500">
                Học sinh không còn khoản nợ có thể thanh toán.
              </p>
            ) : (
              eligible.map((receivable) => {
                const index = selected.findIndex(
                  (item) => item.receivableId === receivable.id,
                );
                const checked = index >= 0;
                return (
                  <div
                    key={receivable.id}
                    className="grid grid-cols-[32px_1fr_150px] items-center gap-3 border-t border-slate-100 px-4 py-3"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) => {
                        if (value)
                          setValue(
                            "items",
                            [
                              ...selected,
                              {
                                receivableId: receivable.id,
                                amount: receivable.amountOutstanding,
                              },
                            ],
                            { shouldValidate: true },
                          );
                        else
                          setValue(
                            "items",
                            selected.filter(
                              (item) => item.receivableId !== receivable.id,
                            ),
                            { shouldValidate: true },
                          );
                      }}
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {receivable.feePlan?.billingType === "MONTHLY"
                          ? (receivable.description ?? receivable.feePlan.name)
                          : (receivable.feePlan?.name ??
                            receivable.description ??
                            receivable.receivableCode)}
                      </p>
                      <p className="text-xs text-slate-400">
                        Còn nợ {formatCurrency(receivable.amountOutstanding)}
                      </p>
                    </div>
                    {checked ? (
                      <Input
                        inputMode="decimal"
                        aria-label="Số tiền thanh toán"
                        {...register(`items.${index}.amount`)}
                      />
                    ) : (
                      <span className="text-right text-sm text-slate-300">
                        —
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
          {errors.items?.message && (
            <p className="mt-2 text-xs font-medium text-rose-600">
              {errors.items.message}
            </p>
          )}
          <div className="mt-4 flex items-center justify-between rounded-xl bg-teal-50 px-4 py-3">
            <span className="text-sm font-semibold text-teal-900">
              Tổng yêu cầu
            </span>
            <span className="font-display text-xl font-bold text-teal-800">
              {formatCurrency(total.toFixed(2))}
            </span>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending || eligible.length === 0}
            >
              <CreditCard />
              {mutation.isPending ? "Đang tạo…" : "Tạo yêu cầu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
