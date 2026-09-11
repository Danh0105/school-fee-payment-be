"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error-messages";
import { Button } from "@/components/ui/button";
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

export function DeleteAction({
  label,
  description,
  queryKey,
  onDelete,
}: {
  label: string;
  description: string;
  queryKey: readonly unknown[];
  onDelete: () => Promise<unknown>;
}) {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: onDelete,
    onSuccess: () => {
      toast.success(`Đã xóa ${label.toLowerCase()}`);
      void client.invalidateQueries({ queryKey });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="size-8 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
          aria-label={`Xóa ${label}`}
        >
          <Trash2 />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa {label.toLowerCase()}?</AlertDialogTitle>
          <AlertDialogDescription>
            {description} Thao tác này không thể hoàn tác từ giao diện.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Quay lại</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Đang xóa…" : "Xác nhận xóa"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
