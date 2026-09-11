"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Unlink } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/error-messages";
import { queryKeys } from "@/lib/query-keys";
import { reconciliationApi } from "../api";

const schema = z.object({
  reason: z.string().trim().min(3, "Lý do cần ít nhất 3 ký tự"),
});
export function UnmatchDialog({ transactionId }: { transactionId: string }) {
  const client = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  const mutation = useMutation({
    mutationFn: ({ reason }: z.infer<typeof schema>) =>
      reconciliationApi.unmatch(transactionId, reason),
    onSuccess: () => {
      toast.success("Đã hủy khớp giao dịch");
      void client.invalidateQueries({ queryKey: queryKeys.reconciliation });
      void client.invalidateQueries({ queryKey: queryKeys.transactions });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-rose-600">
          <Unlink />
          Hủy khớp
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <AlertDialogHeader>
            <AlertDialogTitle>Hủy khớp giao dịch?</AlertDialogTitle>
            <AlertDialogDescription>
              Thao tác này sẽ đảo các phân bổ, hủy phiếu thu liên quan và cập
              nhật lại công nợ. Không thể hoàn tác trực tiếp từ UI.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-4">
            <Textarea
              placeholder="Nhập lý do hủy khớp…"
              {...register("reason")}
            />
            {errors.reason?.message && (
              <p className="mt-1 text-xs text-rose-600">
                {errors.reason.message}
              </p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Quay lại</AlertDialogCancel>
            <AlertDialogAction type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Đang xử lý…" : "Xác nhận hủy khớp"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
