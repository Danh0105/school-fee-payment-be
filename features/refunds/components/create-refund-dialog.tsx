"use client";

import { useState } from "react";
import Decimal from "decimal.js";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Plus } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { FormField } from "@/components/form-field";
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
import { Textarea } from "@/components/ui/textarea";
import { useStudentCredits } from "@/features/receivables/hooks";
import { useStudents } from "@/features/students/hooks";
import { getErrorMessage } from "@/lib/error-messages";
import { formatCurrency } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { moneyString } from "@/lib/validation";
import { refundsApi } from "../api";

const schema = z.object({
  studentId: z.uuid("Vui lòng chọn học sinh"),
  paymentTransactionId: z.uuid("Vui lòng chọn giao dịch"),
  amount: moneyString,
  reason: z.string().trim().min(3, "Lý do cần ít nhất 3 ký tự"),
});
type Values = z.infer<typeof schema>;
export function CreateRefundDialog() {
  const [open, setOpen] = useState(false);
  const client = useQueryClient();
  const students = useStudents({
    limit: 200,
    sortBy: "fullName",
    sortOrder: "ASC",
  });
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      studentId: "",
      paymentTransactionId: "",
      amount: "",
      reason: "",
    },
  });
  const studentId = useWatch({ control, name: "studentId" });
  const credits = useStudentCredits(studentId);
  const available =
    credits.data?.credits.filter(
      (credit) =>
        credit.status === "AVAILABLE" &&
        new Decimal(credit.remainingAmount).gt(0),
    ) ?? [];
  const mutation = useMutation({
    mutationFn: (values: Values) =>
      refundsApi.create({
        paymentTransactionId: values.paymentTransactionId,
        amount: values.amount,
        reason: values.reason,
      }),
    onSuccess: () => {
      toast.success("Đã tạo yêu cầu hoàn tiền");
      void client.invalidateQueries({ queryKey: queryKeys.refunds });
      void client.invalidateQueries({ queryKey: queryKeys.students });
      setOpen(false);
      reset();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Tạo hoàn tiền
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo yêu cầu hoàn tiền</DialogTitle>
          <DialogDescription>
            Chỉ giao dịch đang tạo số dư có khả dụng mới xuất hiện để lựa chọn.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
          className="space-y-4"
        >
          <FormField
            label="Học sinh"
            required
            error={errors.studentId?.message}
          >
            <Controller
              name="studentId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn học sinh" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.data?.data.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.fullName} · {item.studentCode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <FormField
            label="Giao dịch tạo số dư"
            required
            error={errors.paymentTransactionId?.message}
          >
            <Controller
              name="paymentTransactionId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                  disabled={!studentId}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        studentId ? "Chọn giao dịch" : "Chọn học sinh trước"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {available.map((credit) => (
                      <SelectItem
                        key={credit.id}
                        value={credit.sourcePaymentTransactionId}
                      >
                        {credit.sourcePaymentTransactionId.slice(0, 8)}… · còn{" "}
                        {formatCurrency(credit.remainingAmount)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <FormField
            label="Số tiền hoàn"
            required
            error={errors.amount?.message}
          >
            <Input inputMode="decimal" {...register("amount")} />
          </FormField>
          <FormField label="Lý do hoàn" required error={errors.reason?.message}>
            <Textarea {...register("reason")} />
          </FormField>
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
              disabled={mutation.isPending || !available.length}
            >
              {mutation.isPending ? "Đang tạo…" : "Xác nhận hoàn"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
