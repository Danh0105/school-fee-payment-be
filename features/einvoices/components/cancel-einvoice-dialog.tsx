"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Ban } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import {
  AlertDialog,
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
import { einvoicesApi, getEInvoiceErrorMessage } from "../api";
import { invalidateEInvoices } from "../invalidate";

const schema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, "Lý do cần ít nhất 3 ký tự")
    .max(500, "Lý do tối đa 500 ký tự"),
});

export function CancelEInvoiceDialog({
  invoiceId,
  invoiceNo,
}: {
  invoiceId: string;
  invoiceNo: string;
}) {
  const [open, setOpen] = useState(false);
  const client = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  const mutation = useMutation({
    mutationFn: ({ reason }: z.infer<typeof schema>) =>
      einvoicesApi.cancel(invoiceId, reason),
    onSuccess: () => {
      toast.success(`Đã hủy hóa đơn ${invoiceNo} trên Viettel`);
      setOpen(false);
      reset();
      invalidateEInvoices(client);
    },
    onError: (error) => toast.error(getEInvoiceErrorMessage(error)),
  });
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Ban />
          Hủy hóa đơn
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <AlertDialogHeader>
            <AlertDialogTitle>Hủy hóa đơn {invoiceNo}?</AlertDialogTitle>
            <AlertDialogDescription>
              Lệnh hủy được gửi ngay sang Viettel S-Invoice và không thể hoàn
              tác. Hóa đơn đã gửi cơ quan thuế có thể cần lập biên bản hủy với
              phụ huynh theo quy định.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-4">
            <Textarea
              placeholder="Nhập lý do hủy hóa đơn…"
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
            {/* AlertDialogAction would close the dialog, and unmount this
                form, before the submit event reaches it. */}
            <Button
              type="submit"
              variant="destructive"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Đang hủy…" : "Xác nhận hủy"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
