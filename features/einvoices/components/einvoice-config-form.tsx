"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm, useWatch, type Control } from "react-hook-form";
import { Save } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import type { EInvoiceConfig } from "@/lib/types";
import {
  einvoicesApi,
  getEInvoiceErrorMessage,
  type EInvoiceConfigPayload,
} from "../api";

/** Viettel's tax codes: -2 không kê khai nộp thuế, -1 không chịu thuế. */
const TAX_OPTIONS = [
  { value: "-2", label: "Không kê khai, tính nộp thuế (KKKNT)" },
  { value: "-1", label: "Không chịu thuế (KCT)" },
  { value: "0", label: "0%" },
  { value: "5", label: "5%" },
  { value: "8", label: "8%" },
  { value: "10", label: "10%" },
] as const;

const schema = z
  .object({
    enabled: z.boolean(),
    autoIssue: z.boolean(),
    supplierTaxCode: z
      .string()
      .trim()
      .regex(/^\d{10}(-\d{3})?$/, "Mã số thuế gồm 10 số, hoặc 10 số-3 số"),
    templateCode: z
      .string()
      .trim()
      .min(1, "Mẫu số là bắt buộc")
      .max(20, "Tối đa 20 ký tự"),
    invoiceSeries: z
      .string()
      .trim()
      .min(1, "Ký hiệu là bắt buộc")
      .max(25, "Tối đa 25 ký tự"),
    taxPercentage: z.enum(["-2", "-1", "0", "5", "8", "10"]),
    pricesIncludeTax: z.enum(["", "true", "false"]),
  })
  .refine(
    (values) => Number(values.taxPercentage) <= 0 || values.pricesIncludeTax,
    {
      path: ["pricesIncludeTax"],
      message: "Chọn giá học phí đã gồm thuế hay chưa",
    },
  );
type Values = z.infer<typeof schema>;

function toValues(config: EInvoiceConfig | null): Values {
  const tax = config?.taxPercentage;
  return {
    enabled: config?.enabled ?? false,
    autoIssue: config?.autoIssue ?? true,
    supplierTaxCode: config?.supplierTaxCode ?? "",
    templateCode: config?.templateCode ?? "",
    invoiceSeries: config?.invoiceSeries ?? "",
    // numeric(5,2) comes back as "-2.00".
    taxPercentage: (tax == null
      ? "-2"
      : String(Number(tax))) as Values["taxPercentage"],
    pricesIncludeTax:
      config?.pricesIncludeTax == null
        ? ""
        : (String(config.pricesIncludeTax) as "true" | "false"),
  };
}

export function EInvoiceConfigForm({
  schoolId,
  config,
  canEdit,
}: {
  schoolId: string;
  config: EInvoiceConfig | null;
  canEdit: boolean;
}) {
  const client = useQueryClient();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: toValues(config),
  });
  const taxPercentage = useWatch({ control, name: "taxPercentage" });
  const taxed = Number(taxPercentage) > 0;
  const mutation = useMutation({
    mutationFn: (values: Values) => {
      const payload: EInvoiceConfigPayload = {
        enabled: values.enabled,
        autoIssue: values.autoIssue,
        supplierTaxCode: values.supplierTaxCode,
        templateCode: values.templateCode,
        invoiceSeries: values.invoiceSeries,
        taxPercentage: values.taxPercentage,
        // Only HSM (Viettel signs server-side) is wired to the issue flow.
        signingMode: "HSM",
      };
      if (values.pricesIncludeTax)
        payload.pricesIncludeTax = values.pricesIncludeTax === "true";
      return einvoicesApi.saveConfig(schoolId, payload);
    },
    onSuccess: (saved) => {
      toast.success("Đã lưu cấu hình hóa đơn điện tử");
      reset(toValues(saved));
      client.setQueryData([...queryKeys.einvoices, "config", schoolId], saved);
    },
    onError: (error) => toast.error(getEInvoiceErrorMessage(error)),
  });

  return (
    <form
      className="space-y-6"
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
    >
      <fieldset disabled={!canEdit} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <CheckboxField
            control={control}
            name="enabled"
            label="Bật hóa đơn điện tử cho trường"
            hint="Tắt thì không phát hành hóa đơn mới, kể cả bấm tay."
          />
          <CheckboxField
            control={control}
            name="autoIssue"
            label="Tự động xuất khi thanh toán được khớp"
            hint="Tắt thì kế toán bấm Xuất hóa đơn trên từng phiếu thu."
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <FormField
            label="Mã số thuế bên bán"
            htmlFor="supplierTaxCode"
            error={errors.supplierTaxCode?.message}
            required
          >
            <Input
              id="supplierTaxCode"
              inputMode="numeric"
              placeholder="0316660845"
              {...register("supplierTaxCode")}
            />
          </FormField>
          <FormField
            label="Mẫu số"
            htmlFor="templateCode"
            error={errors.templateCode?.message}
            hint="Theo thông báo phát hành trên Viettel, ví dụ 1/001."
            required
          >
            <Input
              id="templateCode"
              placeholder="1/001"
              {...register("templateCode")}
            />
          </FormField>
          <FormField
            label="Ký hiệu"
            htmlFor="invoiceSeries"
            error={errors.invoiceSeries?.message}
            hint="Ví dụ C26TAA."
            required
          >
            <Input
              id="invoiceSeries"
              placeholder="C26TAA"
              {...register("invoiceSeries")}
            />
          </FormField>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            label="Thuế suất GTGT"
            error={errors.taxPercentage?.message}
            required
          >
            <Controller
              control={control}
              name="taxPercentage"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!canEdit}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TAX_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <FormField
            label="Học phí đã gồm thuế?"
            error={errors.pricesIncludeTax?.message}
            hint={
              taxed
                ? "Quyết định cách tách tiền trước thuế và tiền thuế."
                : "Chỉ cần khi thuế suất lớn hơn 0."
            }
            required={taxed}
          >
            <Controller
              control={control}
              name="pricesIncludeTax"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!canEdit || !taxed}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Giá đã gồm thuế</SelectItem>
                    <SelectItem value="false">Giá chưa gồm thuế</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
        </div>
        <p className="text-xs text-slate-500">
          Hình thức ký: HSM — Viettel ký số trên máy chủ khi phát hành. Đơn vị
          tiền tệ: VND.
        </p>
      </fieldset>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
        <p className="text-xs text-slate-400">
          {config
            ? `Cập nhật lần cuối ${formatDate(config.updatedAt, true)}`
            : "Trường chưa có cấu hình hóa đơn điện tử."}
        </p>
        {canEdit && (
          <Button type="submit" disabled={mutation.isPending || !isDirty}>
            <Save />
            {mutation.isPending ? "Đang lưu…" : "Lưu cấu hình"}
          </Button>
        )}
      </div>
    </form>
  );
}

function CheckboxField({
  control,
  name,
  label,
  hint,
}: {
  control: Control<Values>;
  name: "enabled" | "autoIssue";
  label: string;
  hint: string;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="flex items-start gap-3 rounded-xl border border-slate-200 p-4">
          <Checkbox
            id={name}
            checked={field.value}
            onCheckedChange={(checked) => field.onChange(checked === true)}
            className="mt-0.5"
          />
          <div>
            <Label htmlFor={name}>{label}</Label>
            <p className="mt-1 text-xs text-slate-500">{hint}</p>
          </div>
        </div>
      )}
    />
  );
}
