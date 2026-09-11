"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Banknote } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/error-messages";
import { queryKeys } from "@/lib/query-keys";
import { moneyString, requiredText } from "@/lib/validation";
import { paymentTransactionsApi } from "../api";

const schema = z.object({
  externalTransactionId: requiredText("Mã giao dịch"),
  amount: moneyString,
  transferContent: requiredText("Nội dung chuyển tiền"),
});
type Values = z.infer<typeof schema>;

export function ManualCashForm({
  orderId,
  orderCode,
  amount,
}: {
  orderId: string;
  orderCode: string;
  amount: string;
}) {
  const client = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      externalTransactionId: "",
      amount,
      transferContent: orderCode,
    },
  });
  useEffect(() => {
    reset({
      externalTransactionId: `CASH-${orderCode}-${Date.now()}`,
      amount,
      transferContent: orderCode,
    });
  }, [orderCode, amount, reset]);
  const mutation = useMutation({
    mutationFn: paymentTransactionsApi.manual,
    onSuccess: () => {
      toast.success("Đã ghi nhận thu tiền mặt");
      void client.invalidateQueries({
        queryKey: [...queryKeys.paymentOrders, orderId],
      });
      void client.invalidateQueries({ queryKey: queryKeys.transactions });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Banknote className="size-5 text-teal-700" />
          Ghi nhận thu tiền mặt
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
        >
          <FormField
            label="Mã giao dịch"
            required
            error={errors.externalTransactionId?.message}
          >
            <Input {...register("externalTransactionId")} />
          </FormField>
          <FormField label="Số tiền" required error={errors.amount?.message}>
            <Input inputMode="decimal" {...register("amount")} />
          </FormField>
          <div className="sm:col-span-2">
            <FormField
              label="Nội dung đối soát"
              required
              error={errors.transferContent?.message}
            >
              <Input
                readOnly
                className="bg-slate-50"
                {...register("transferContent")}
              />
            </FormField>
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Đang ghi nhận…" : "Xác nhận đã thu tiền"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
