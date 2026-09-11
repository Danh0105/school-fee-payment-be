"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link2 } from "lucide-react";
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
import { getErrorMessage } from "@/lib/error-messages";
import { queryKeys } from "@/lib/query-keys";
import { reconciliationApi } from "../api";

const schema = z.object({
  paymentOrderId: z.uuid("ID yêu cầu thanh toán không đúng định dạng UUID"),
});
export function MatchDialog({ transactionId }: { transactionId: string }) {
  const [open, setOpen] = useState(false);
  const client = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { paymentOrderId: "" },
  });
  const mutation = useMutation({
    mutationFn: ({ paymentOrderId }: z.infer<typeof schema>) =>
      reconciliationApi.match(transactionId, paymentOrderId),
    onSuccess: () => {
      toast.success("Đã khớp giao dịch");
      void client.invalidateQueries({ queryKey: queryKeys.reconciliation });
      void client.invalidateQueries({ queryKey: queryKeys.transactions });
      setOpen(false);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Link2 />
          Khớp đơn
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Khớp giao dịch thủ công</DialogTitle>
          <DialogDescription>
            Backend hiện chỉ cung cấp tra cứu Payment Order theo ID, vì vậy hãy
            nhập UUID của yêu cầu thanh toán cần khớp.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <FormField
            label="Payment Order ID"
            required
            error={errors.paymentOrderId?.message}
          >
            <Input
              className="font-mono"
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              {...register("paymentOrderId")}
            />
          </FormField>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Đang đối soát…" : "Xác nhận khớp"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
