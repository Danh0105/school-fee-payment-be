"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Decimal from "decimal.js";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { FormField } from "@/components/form-field";
import { CurrentAcademicYearBadge } from "@/components/current-academic-year-badge";
import { Badge } from "@/components/ui/badge";
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
import { useCurrentAcademicYear } from "@/features/academic-years/hooks";
import { useFeeCategories } from "@/features/fee-categories/hooks";
import { useSchools } from "@/features/schools/hooks";
import { getErrorMessage } from "@/lib/error-messages";
import { formatCurrency } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import type { FeePlan } from "@/lib/types";
import { moneyString, omitEmpty, optionalText, uuid } from "@/lib/validation";
import {
  feePlansApi,
  type CreateFeePlanPayload,
  type UpdateFeePlanPayload,
} from "../api";

const schema = z.object({
  schoolId: uuid("trường"),
  feeCategoryId: uuid("danh mục"),
  unitPrice: moneyString,
  quantity: moneyString,
  description: optionalText,
  status: z.enum(["DRAFT", "ACTIVE", "CLOSED", "CANCELLED"]),
});
type Values = z.infer<typeof schema>;

export function FeePlanDialog({
  plan,
  schoolId = "",
  trigger,
}: {
  plan?: FeePlan;
  schoolId?: string;
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const client = useQueryClient();
  const schools = useSchools({ limit: 200, sortBy: "name", sortOrder: "ASC" });
  const defaults = useMemo<Values>(
    () => ({
      schoolId: plan?.schoolId ?? schoolId,
      feeCategoryId: plan?.feeCategoryId ?? "",
      unitPrice: plan?.unitPrice ?? "",
      quantity: plan?.quantity ?? "",
      description: plan?.description ?? "",
      status: plan?.status ?? "DRAFT",
    }),
    [plan, schoolId],
  );
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });
  useEffect(() => {
    if (open) reset(defaults);
  }, [open, reset, defaults]);
  const selectedSchoolId = useWatch({ control, name: "schoolId" });
  const unitPrice = useWatch({ control, name: "unitPrice" });
  const quantity = useWatch({ control, name: "quantity" });
  const estimatedAnnualAmount = useMemo(() => {
    try {
      const price = new Decimal(unitPrice || 0);
      const count = new Decimal(quantity || 0);
      if (!price.isPositive() || !count.isPositive()) return null;
      return price.times(count).toFixed(2);
    } catch {
      return null;
    }
  }, [quantity, unitPrice]);
  const currentYear = useCurrentAcademicYear(selectedSchoolId);
  const categories = useFeeCategories(
    {
      limit: 200,
      schoolId: selectedSchoolId || undefined,
      status: "ACTIVE",
      sortBy: "name",
      sortOrder: "ASC",
    },
    Boolean(selectedSchoolId && currentYear.data),
  );
  const mutation = useMutation({
    mutationFn: (values: Values) => {
      if (plan) {
        const payload: UpdateFeePlanPayload = omitEmpty({
          unitPrice: values.unitPrice,
          quantity: values.quantity,
          description: values.description,
          status: values.status,
        });
        if (!new Decimal(values.quantity).equals(plan.quantity)) {
          payload.billingType = new Decimal(values.quantity).equals(1)
            ? "ONE_TIME"
            : "MONTHLY";
        }
        return feePlansApi.update(plan.id, payload);
      }
      const payload: CreateFeePlanPayload = omitEmpty({
        schoolId: values.schoolId,
        feeCategoryId: values.feeCategoryId,
        unitPrice: values.unitPrice,
        quantity: values.quantity,
        description: values.description,
        status: values.status,
      });
      return feePlansApi.create(payload);
    },
    onSuccess: () => {
      toast.success(plan ? "Đã cập nhật kế hoạch thu" : "Đã tạo kế hoạch thu");
      void client.invalidateQueries({ queryKey: queryKeys.feePlans });
      setOpen(false);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {plan ? "Cập nhật kế hoạch thu" : "Tạo kế hoạch thu"}
          </DialogTitle>
          <DialogDescription>
            Mã, tên kế hoạch và năm học được hệ thống tự động xác định.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <div className="grid gap-4 sm:grid-cols-2">
            {plan ? (
              <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <div>
                  <p className="font-semibold text-slate-900">{plan.name}</p>
                  <p className="mt-1 font-mono text-xs text-slate-500">
                    {plan.code}
                  </p>
                </div>
                <BillingTypeBadge billingType={plan.billingType} />
              </div>
            ) : (
              <FormField
                label="Trường"
                required
                error={errors.schoolId?.message}
              >
                <Controller
                  name="schoolId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      disabled={Boolean(schoolId)}
                      onValueChange={(value) => {
                        field.onChange(value);
                        setValue("feeCategoryId", "");
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trường" />
                      </SelectTrigger>
                      <SelectContent>
                        {schools.data?.data.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
            )}

            <FormField label="Năm học hiện tại">
              <div className="flex h-10 items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
                <CurrentAcademicYearBadge
                  name={currentYear.data?.name}
                  loading={currentYear.isLoading}
                  error={currentYear.error}
                  emptyLabel="Chưa xác định"
                />
              </div>
            </FormField>

            {!plan && (
              <FormField
                label="Danh mục khoản thu"
                required
                error={errors.feeCategoryId?.message}
              >
                <Controller
                  name="feeCategoryId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                      disabled={!currentYear.data || categories.isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.data?.data.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
            )}

            <FormField
              label="Đơn giá"
              required
              error={errors.unitPrice?.message}
            >
              <Input
                inputMode="decimal"
                placeholder="80000"
                {...register("unitPrice")}
              />
            </FormField>

            <FormField
              label="Số lượng"
              required
              error={errors.quantity?.message}
            >
              <div className="space-y-2">
                <Input
                  inputMode="decimal"
                  placeholder="9"
                  {...register("quantity")}
                />
                <p className="text-xs leading-5 text-slate-500">
                  Tổng số tháng của cả năm học. Nhập 1 cho khoản thu một lần;
                  nhập lớn hơn 1 cho khoản thu theo tháng, được chia thành Học
                  kỳ 1 và Học kỳ 2 khi gán.
                </p>
                <div className="flex items-center justify-between rounded-xl bg-teal-50 px-3 py-2 text-sm">
                  <span className="font-medium text-teal-900">
                    Thành tiền dự kiến cả năm
                  </span>
                  <span className="font-bold text-teal-800">
                    {estimatedAnnualAmount
                      ? formatCurrency(estimatedAnnualAmount)
                      : "—"}
                  </span>
                </div>
              </div>
            </FormField>

            <FormField label="Trạng thái" error={errors.status?.message}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Bản nháp</SelectItem>
                      <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                      <SelectItem value="CLOSED">Đã đóng</SelectItem>
                      <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <div className="sm:col-span-2">
              <FormField label="Mô tả" error={errors.description?.message}>
                <Textarea {...register("description")} />
              </FormField>
            </div>
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
              disabled={mutation.isPending || !currentYear.data}
            >
              {mutation.isPending ? "Đang lưu…" : "Lưu kế hoạch"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function BillingTypeBadge({
  billingType,
}: {
  billingType: FeePlan["billingType"];
}) {
  if (billingType === "ONE_TIME") {
    return <Badge variant="secondary">Thu một lần</Badge>;
  }
  if (billingType === "MONTHLY") {
    return <Badge variant="info">Theo tháng (chia học kỳ)</Badge>;
  }
  return <Badge variant="warning">Tùy chỉnh</Badge>;
}
