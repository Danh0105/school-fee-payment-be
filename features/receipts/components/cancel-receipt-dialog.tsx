"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Ban } from "lucide-react";
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
import { receiptsApi } from "../api";

const schema = z.object({
  reason: z.string().trim().min(3, "Lý do cần ít nhất 3 ký tự"),
});
export function CancelReceiptDialog({ receiptId }: { receiptId: string }) {
  const client = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  const mutation = useMutation({
    mutationFn: ({ reason }: z.infer<typeof schema>) =>
      receiptsApi.cancel(receiptId, reason),
    onSuccess: () => {
      toast.success("Đã hủy phiếu thu");
      void client.invalidateQueries({ queryKey: queryKeys.receipts });
      void client.invalidateQueries({ queryKey: queryKeys.receivables });
      void client.invalidateQueries({ queryKey: queryKeys.transactions });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Ban />
          Hủy phiếu thu
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận hủy phiếu thu?</AlertDialogTitle>
            <AlertDialogDescription>
              Phiếu thu bị hủy không thể phục hồi từ giao diện. Lý do sẽ được
              ghi vĩnh viễn vào chứng từ và nhật ký hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-4">
            <Textarea
              placeholder="Nhập lý do hủy phiếu…"
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
              {mutation.isPending ? "Đang hủy…" : "Xác nhận hủy"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
