"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  RotateCcw,
  UploadCloud,
} from "lucide-react";
import { z } from "zod";
import { PageHeader } from "@/components/page-header";
import { FormField } from "@/components/form-field";
import { CurrentAcademicYearBadge } from "@/components/current-academic-year-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCurrentAcademicYear } from "@/features/academic-years/hooks";
import { useFeePlans } from "@/features/fee-plans/hooks";
import { useConfirmImport, usePreviewImport } from "@/features/imports/hooks";
import { useSchools } from "@/features/schools/hooks";
import { uuid } from "@/lib/validation";
import { useAuthStore } from "@/stores/auth-store";

const schema = z
  .object({
    file: z.custom<FileList>(
      (value) => value instanceof FileList && value.length > 0,
      "Vui lòng chọn file Excel",
    ),
    schoolId: uuid("trường"),
    feePlanId: z.union([z.literal(""), z.uuid()]).optional(),
    type: z.enum(["STUDENTS", "RECEIVABLES", "COMBINED"]),
  })
  .superRefine((value, ctx) => {
    if (value.type !== "STUDENTS" && !value.feePlanId)
      ctx.addIssue({
        code: "custom",
        path: ["feePlanId"],
        message: "Khoản thu là bắt buộc với loại này",
      });
  });
type Values = z.infer<typeof schema>;

export default function ImportsPage() {
  const preview = usePreviewImport();
  const confirm = useConfirmImport();
  const schoolId = useAuthStore((state) => state.user?.schoolId) ?? "";
  const schools = useSchools({ limit: 200 });
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      schoolId,
      feePlanId: "",
      type: "COMBINED",
    },
  });
  const type = useWatch({ control, name: "type" });
  const selectedSchoolId = useWatch({ control, name: "schoolId" });
  const currentYear = useCurrentAcademicYear(selectedSchoolId);
  const plans = useFeePlans(
    {
      limit: 200,
      schoolId: selectedSchoolId || undefined,
      academicYearId: currentYear.data?.id,
      status: "ACTIVE",
    },
    Boolean(selectedSchoolId && currentYear.data),
  );
  const restart = () => {
    preview.reset();
    confirm.reset();
    reset({ schoolId, feePlanId: "", type: "COMBINED" });
  };
  return (
    <>
      <PageHeader
        eyebrow="Nhập dữ liệu"
        title="Import từ Excel"
        description="Mọi file đều phải qua bước kiểm tra trước khi ghi vào hệ thống."
      />
      <div className="mb-6 flex items-center gap-3">
        <Step
          active={!preview.data}
          done={!!preview.data}
          number="1"
          label="Tải lên & kiểm tra"
        />
        <div className="h-px flex-1 bg-slate-200" />
        <Step
          active={!!preview.data && !confirm.data}
          done={!!confirm.data}
          number="2"
          label="Xác nhận import"
        />
      </div>
      {!preview.data ? (
        <Card className="mx-auto max-w-3xl">
          <CardHeader>
            <CardTitle>Chọn nguồn dữ liệu</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-5 sm:grid-cols-2"
              onSubmit={handleSubmit((values) => {
                if (!currentYear.data) return;
                preview.mutate({
                  file: values.file[0],
                  schoolId: values.schoolId,
                  academicYearId: currentYear.data.id,
                  feePlanId: values.feePlanId || undefined,
                  type: values.type,
                });
              })}
            >
              <div className="sm:col-span-2">
                <FormField
                  label="File Excel"
                  required
                  error={errors.file?.message as string | undefined}
                  hint="Hỗ trợ .xlsx và .xls theo mẫu import của hệ thống."
                >
                  <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 text-center transition hover:border-teal-400 hover:bg-teal-50">
                    <UploadCloud className="mb-3 size-8 text-teal-600" />
                    <p className="text-sm font-semibold text-slate-700">
                      Chọn file từ máy tính
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Tệp tối đa theo giới hạn backend
                    </p>
                    <Input
                      type="file"
                      accept=".xlsx,.xls"
                      className="sr-only"
                      {...register("file")}
                    />
                  </label>
                </FormField>
              </div>
              <FormField
                label="Loại import"
                required
                error={errors.type?.message}
              >
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STUDENTS">Chỉ học sinh</SelectItem>
                        <SelectItem value="RECEIVABLES">Chỉ công nợ</SelectItem>
                        <SelectItem value="COMBINED">
                          Học sinh & công nợ
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
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
                        setValue("feePlanId", "");
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
              <FormField label="Năm học hiện tại">
                <div className="flex h-10 items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
                  <CurrentAcademicYearBadge
                    name={currentYear.data?.name}
                    loading={currentYear.isLoading}
                    error={currentYear.error}
                    emptyLabel="Chọn trường để xác định"
                  />
                </div>
              </FormField>
              {type !== "STUDENTS" && (
                <FormField
                  label="Kế hoạch thu"
                  required
                  error={errors.feePlanId?.message}
                >
                  <Controller
                    name="feePlanId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                        disabled={!currentYear.data || plans.isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn khoản thu" />
                        </SelectTrigger>
                        <SelectContent>
                          {plans.data?.data.map((item) => (
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
              <div className="sm:col-span-2 flex justify-end">
                <Button
                  type="submit"
                  size="lg"
                  disabled={preview.isPending || !currentYear.data}
                >
                  <FileSpreadsheet />
                  {preview.isPending ? "Đang kiểm tra…" : "Kiểm tra dữ liệu"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : confirm.data ? (
        <Card className="mx-auto max-w-3xl">
          <CardContent className="flex flex-col items-center p-10 text-center">
            <span className="mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="size-8" />
            </span>
            <h3 className="font-display text-2xl font-bold text-slate-950">
              Import hoàn tất
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Dữ liệu hợp lệ đã được ghi vào hệ thống.
            </p>
            <div className="mt-7 grid w-full gap-3 sm:grid-cols-4">
              {[
                ["HS tạo mới", confirm.data.studentsCreated],
                ["HS đã có", confirm.data.studentsMatched],
                ["Công nợ tạo", confirm.data.receivablesCreated],
                ["Công nợ bỏ qua", confirm.data.receivablesSkipped],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-xl bg-slate-50 p-4">
                  <p className="font-display text-2xl font-bold text-slate-950">
                    {value}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </div>
            <Button className="mt-7" variant="outline" onClick={restart}>
              <RotateCcw />
              Import file khác
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <Summary label="Tổng số dòng" value={preview.data.totalRows} />
            <Summary
              label="Hợp lệ"
              value={preview.data.validRows}
              tone="green"
            />
            <Summary
              label="Không hợp lệ"
              value={preview.data.invalidRows}
              tone="red"
            />
          </div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Chi tiết kiểm tra</CardTitle>
                {preview.data.invalidRows ? (
                  <Badge variant="destructive">
                    <AlertCircle className="mr-1 size-3" />
                    Có lỗi cần xem
                  </Badge>
                ) : (
                  <Badge variant="success">
                    <CheckCircle2 className="mr-1 size-3" />
                    Sẵn sàng
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {preview.data.errors.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sheet</TableHead>
                      <TableHead>Dòng</TableHead>
                      <TableHead>Cột / Field</TableHead>
                      <TableHead>Giá trị</TableHead>
                      <TableHead>Lỗi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.data.errors.map((error, index) => (
                      <TableRow
                        key={`${error.sheet}-${error.row}-${error.column}-${index}`}
                        className="bg-rose-50/50"
                      >
                        <TableCell>{error.sheet}</TableCell>
                        <TableCell className="font-bold text-rose-700">
                          {error.row}
                        </TableCell>
                        <TableCell>
                          {error.column} · {error.field}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {String(error.value ?? "")}
                        </TableCell>
                        <TableCell className="text-rose-700">
                          {error.message}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex min-h-40 flex-col items-center justify-center text-emerald-700">
                  <CheckCircle2 className="mb-3 size-9" />
                  <p className="font-semibold">Không phát hiện lỗi dữ liệu</p>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="flex justify-between">
            <Button variant="outline" onClick={restart}>
              <RotateCcw />
              Chọn lại file
            </Button>
            <Button
              disabled={!preview.data.validRows || confirm.isPending}
              onClick={() => confirm.mutate(preview.data.importSessionId)}
            >
              {confirm.isPending
                ? "Đang import…"
                : `Xác nhận import ${preview.data.validRows} dòng`}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
function Step({
  active,
  done,
  number,
  label,
}: {
  active: boolean;
  done: boolean;
  number: string;
  label: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 ${active || done ? "text-teal-700" : "text-slate-400"}`}
    >
      <span
        className={`flex size-8 items-center justify-center rounded-full text-sm font-bold ${active || done ? "bg-teal-600 text-white" : "bg-slate-200"}`}
      >
        {done ? "✓" : number}
      </span>
      <span className="hidden text-sm font-semibold sm:block">{label}</span>
    </div>
  );
}
function Summary({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "green" | "red";
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-slate-500">{label}</p>
        <p
          className={`mt-2 font-display text-3xl font-bold ${tone === "green" ? "text-emerald-700" : tone === "red" ? "text-rose-700" : "text-slate-950"}`}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
