"use client";

import { useEffect, useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useClasses } from "@/features/classes/hooks";
import { useStudents } from "@/features/students/hooks";
import { getErrorMessage } from "@/lib/error-messages";
import { queryKeys } from "@/lib/query-keys";
import type { FeePlan } from "@/lib/types";
import { feePlansApi } from "../api";

const schema = z
  .object({
    targetType: z.enum(["SCHOOL", "GRADE", "CLASS", "STUDENT"]),
    grade: z.string().optional(),
    classIds: z.array(z.uuid()).optional(),
    studentIds: z.array(z.uuid()).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.targetType === "GRADE" && !value.grade?.trim())
      ctx.addIssue({
        code: "custom",
        path: ["grade"],
        message: "Vui lòng nhập khối",
      });
    if (value.targetType === "CLASS" && !value.classIds?.length)
      ctx.addIssue({
        code: "custom",
        path: ["classIds"],
        message: "Chọn ít nhất một lớp",
      });
    if (value.targetType === "STUDENT" && !value.studentIds?.length)
      ctx.addIssue({
        code: "custom",
        path: ["studentIds"],
        message: "Chọn ít nhất một học sinh",
      });
  });
type Values = z.infer<typeof schema>;

export function AssignFeePlanDialog({
  plan,
  trigger,
}: {
  plan: FeePlan;
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const client = useQueryClient();
  const classes = useClasses({
    limit: 200,
    schoolId: plan.schoolId,
    academicYearId: plan.academicYearId,
    sortBy: "name",
    sortOrder: "ASC",
  });
  const students = useStudents({
    limit: 200,
    schoolId: plan.schoolId,
    sortBy: "fullName",
    sortOrder: "ASC",
  });
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
      targetType: "SCHOOL",
      grade: "",
      classIds: [],
      studentIds: [],
    },
  });
  useEffect(() => {
    if (open)
      reset({ targetType: "SCHOOL", grade: "", classIds: [], studentIds: [] });
  }, [open, reset]);
  const targetType = useWatch({ control, name: "targetType" });
  const classIds = useWatch({ control, name: "classIds" }) ?? [];
  const studentIds = useWatch({ control, name: "studentIds" }) ?? [];
  const mutation = useMutation({
    mutationFn: (values: Values) => feePlansApi.assign(plan.id, values),
    onSuccess: (result) => {
      toast.success(
        `Đã tạo ${result.receivablesCreated} công nợ cho ${result.targetedStudents} học sinh`,
      );
      void client.invalidateQueries({ queryKey: queryKeys.receivables });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gán khoản thu</DialogTitle>
          <DialogDescription>
            {plan.name} · Chỉ tạo công nợ mới, học sinh đã có sẽ được bỏ qua an
            toàn.
          </DialogDescription>
        </DialogHeader>
        {mutation.data ? (
          <div className="space-y-4">
            <p className="rounded-xl bg-teal-50 p-4 text-sm leading-6 text-teal-950">
              <AssignmentResultText
                billingType={plan.billingType}
                targetedStudents={mutation.data.targetedStudents}
                receivablesCreated={mutation.data.receivablesCreated}
                receivablesSkipped={mutation.data.receivablesSkipped}
              />
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Học sinh đã gán", mutation.data.targetedStudents],
                ["Công nợ đã tạo", mutation.data.receivablesCreated],
                ["Công nợ bỏ qua", mutation.data.receivablesSkipped],
              ].map(([label, value], index) => (
                <div
                  key={String(label)}
                  className={
                    index === 2
                      ? "rounded-xl bg-amber-50 p-4"
                      : "rounded-xl bg-slate-50 p-4"
                  }
                >
                  <p className="text-xs font-semibold text-slate-500">
                    {label}
                  </p>
                  <p className="mt-2 font-display text-3xl font-bold text-slate-950">
                    {value}
                  </p>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button type="button" onClick={() => setOpen(false)}>
                Đóng
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit((values) => mutation.mutate(values))}>
            <div className="space-y-5">
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">
                  Phạm vi áp dụng
                </p>
                <Controller
                  name="targetType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SCHOOL">Toàn trường</SelectItem>
                        <SelectItem value="GRADE">Theo khối</SelectItem>
                        <SelectItem value="CLASS">Theo lớp</SelectItem>
                        <SelectItem value="STUDENT">Theo học sinh</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              {targetType === "GRADE" && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-700">
                    Khối
                  </p>
                  <Input placeholder="Ví dụ: 1" {...register("grade")} />
                  {errors.grade?.message && (
                    <p className="mt-1 text-xs text-rose-600">
                      {errors.grade.message}
                    </p>
                  )}
                </div>
              )}
              {targetType === "CLASS" && (
                <ChoiceList
                  items={
                    classes.data?.data.map((item) => ({
                      id: item.id,
                      label: item.name,
                      sub: `Khối ${item.grade ?? "—"}`,
                    })) ?? []
                  }
                  selected={classIds}
                  onChange={(ids) =>
                    setValue("classIds", ids, { shouldValidate: true })
                  }
                  empty="Chưa có lớp phù hợp"
                />
              )}
              {targetType === "STUDENT" && (
                <ChoiceList
                  items={
                    students.data?.data.map((item) => ({
                      id: item.id,
                      label: item.fullName,
                      sub: item.studentCode,
                    })) ?? []
                  }
                  selected={studentIds}
                  onChange={(ids) =>
                    setValue("studentIds", ids, { shouldValidate: true })
                  }
                  empty="Chưa có học sinh phù hợp"
                />
              )}
              {(errors.classIds?.message || errors.studentIds?.message) && (
                <p className="text-xs text-rose-600">
                  {errors.classIds?.message ?? errors.studentIds?.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Đang gán…" : "Xác nhận gán"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function AssignmentResultText({
  billingType,
  targetedStudents,
  receivablesCreated,
  receivablesSkipped,
}: {
  billingType: FeePlan["billingType"];
  targetedStudents: number;
  receivablesCreated: number;
  receivablesSkipped: number;
}) {
  const isSemesterPlan = billingType !== "ONE_TIME";
  const createdAllSemesterPairs =
    isSemesterPlan && receivablesCreated === targetedStudents * 2;

  return (
    <>
      Đã gán cho <strong>{targetedStudents}</strong> học sinh, tạo{" "}
      <strong>{receivablesCreated}</strong> công nợ
      {createdAllSemesterPairs ? (
        <>
          {" "}
          ({targetedStudents} Học kỳ 1 + {targetedStudents} Học kỳ 2)
        </>
      ) : isSemesterPlan ? (
        <> học kỳ (mỗi học sinh tối đa 2: Học kỳ 1 + Học kỳ 2)</>
      ) : (
        <> (mỗi học sinh tối đa 1)</>
      )}
      , bỏ qua <strong>{receivablesSkipped}</strong> công nợ đã có trước đó.
    </>
  );
}

function ChoiceList({
  items,
  selected,
  onChange,
  empty,
}: {
  items: { id: string; label: string; sub: string }[];
  selected: string[];
  onChange: (ids: string[]) => void;
  empty: string;
}) {
  return (
    <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200">
      {items.length ? (
        items.map((item) => {
          const checked = selected.includes(item.id);
          return (
            <label
              key={item.id}
              className="flex cursor-pointer items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-0 hover:bg-slate-50"
            >
              <Checkbox
                checked={checked}
                onCheckedChange={(value) =>
                  onChange(
                    value
                      ? [...selected, item.id]
                      : selected.filter((id) => id !== item.id),
                  )
                }
              />
              <span>
                <span className="block text-sm font-semibold text-slate-800">
                  {item.label}
                </span>
                <span className="block text-xs text-slate-400">{item.sub}</span>
              </span>
            </label>
          );
        })
      ) : (
        <p className="p-6 text-center text-sm text-slate-500">{empty}</p>
      )}
    </div>
  );
}
