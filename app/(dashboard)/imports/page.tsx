"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  QrCode,
  RotateCcw,
  UploadCloud,
} from "lucide-react";
import { z } from "zod";
import { PageHeader } from "@/components/page-header";
import { FormField } from "@/components/form-field";
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
import {
  useConfirmImport,
  useDownloadPaymentQrPdf,
  useDownloadStudentImportTemplate,
  usePreviewImport,
} from "@/features/imports/hooks";
import { useSchools } from "@/features/schools/hooks";

/** Today in Vietnam time, YYYY-MM-DD. */
const todayVn = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(
    new Date(),
  );

const schema = z
  .object({
    file: z
      .custom<FileList>(
        (value) => value instanceof FileList && value.length > 0,
        "Vui lòng chọn file Excel",
      )
      .superRefine((value, ctx) => {
        const file = value?.[0];
        if (!file) return;
        if (!file.name.toLowerCase().endsWith(".xlsx")) {
          ctx.addIssue({
            code: "custom",
            message:
              "Chỉ hỗ trợ file .xlsx. Hãy mở file .xls bằng Excel và lưu lại thành .xlsx.",
          });
        }
      }),
    /** BOOTSTRAP: template with "Thông tin trường"; PAYMENT_LIST: a list with SỐ TIỀN. */
    mode: z.enum(["BOOTSTRAP", "PAYMENT_LIST"]),
    schoolId: z.string().optional(),
    expiryMode: z.enum(["NONE", "DATE"]),
    qrExpiresAt: z.string().optional(),
    serviceName: z.string().max(200, "Tối đa 200 ký tự").optional(),
  })
  .superRefine((values, ctx) => {
    if (values.mode !== "PAYMENT_LIST") return;
    if (!values.schoolId) {
      ctx.addIssue({
        code: "custom",
        path: ["schoolId"],
        message: "Chọn trường của danh sách",
      });
    }
    if (values.expiryMode === "DATE") {
      if (!values.qrExpiresAt) {
        ctx.addIssue({
          code: "custom",
          path: ["qrExpiresAt"],
          message: "Chọn ngày hết hạn của mã QR",
        });
      } else if (values.qrExpiresAt < todayVn()) {
        ctx.addIssue({
          code: "custom",
          path: ["qrExpiresAt"],
          message: "Ngày hết hạn phải từ hôm nay trở đi",
        });
      }
    }
  });
type Values = z.infer<typeof schema>;

export default function ImportsPage() {
  const preview = usePreviewImport();
  const confirm = useConfirmImport();
  const template = useDownloadStudentImportTemplate();
  const downloadPdf = useDownloadPaymentQrPdf();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      mode: "BOOTSTRAP",
      expiryMode: "NONE",
    },
  });
  const selectedFiles = useWatch({ control, name: "file" });
  const mode = useWatch({ control, name: "mode" });
  const schoolId = useWatch({ control, name: "schoolId" });
  const expiryMode = useWatch({ control, name: "expiryMode" });
  const serviceName = useWatch({ control, name: "serviceName" });
  const schools = useSchools({ limit: 200, sortBy: "name", sortOrder: "ASC" });
  const academicYear = useCurrentAcademicYear(
    mode === "PAYMENT_LIST" ? schoolId : undefined,
  );
  const paymentOptions = preview.data?.paymentOptions ?? null;
  const hasAmounts = Boolean(
    preview.data?.rows.some((row) => Number(row.originalAmount) > 0),
  );
  const savesDebts = Boolean(paymentOptions?.createPaymentOrders);
  const pdfFileName = `QR-thanh-toan-${(paymentOptions?.title || "danh-sach")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}.pdf`;
  const exportPdf = () =>
    preview.data &&
    downloadPdf.mutate({
      importSessionId: preview.data.importSessionId,
      fileName: pdfFileName,
    });
  const restart = () => {
    preview.reset();
    confirm.reset();
    reset();
  };
  return (
    <>
      <PageHeader
        eyebrow="Nhập dữ liệu"
        title="Khởi tạo dữ liệu từ Excel"
        description="Tạo trường, năm học, lớp và toàn bộ thông tin học sinh từ một file mẫu."
        actions={
          <Button
            variant="outline"
            disabled={template.isPending}
            onClick={() => template.mutate()}
          >
            <Download />
            {template.isPending ? "Đang xuất file…" : "Xuất file mẫu khởi tạo"}
          </Button>
        }
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
            <CardTitle>Chọn file khởi tạo dữ liệu</CardTitle>
          </CardHeader>
          <CardContent>
            <Controller
              control={control}
              name="mode"
              render={({ field }) => (
                <div className="mb-5 grid gap-2 rounded-xl bg-slate-100 p-1 sm:grid-cols-2">
                  {(
                    [
                      ["BOOTSTRAP", "File mẫu khởi tạo trường"],
                      ["PAYMENT_LIST", "Danh sách thu có SỐ TIỀN"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => field.onChange(value)}
                      className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                        field.value === value
                          ? "bg-white text-teal-700 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            />
            <div className="mb-5 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-800">
              {mode === "PAYMENT_LIST" ? (
                <>
                  File gồm dòng tiêu đề (ví dụ{" "}
                  <strong>DANH SÁCH BỔ SUNG LỚP 3A4 …</strong>) và các cột{" "}
                  <strong>
                    HỌ VÀ TÊN, NGÀY/THÁNG/NĂM SINH, SĐT PHỤ HUYNH, MÃ ĐỊNH DANH
                    CCCD, SỐ TIỀN, NỘI DUNG
                  </strong>
                  . Lớp lấy từ tiêu đề hoặc tên sheet. Khi lưu, mỗi học sinh có
                  công nợ và một mã QR động VietinBank; tiền về tài khoản thu hộ
                  của công ty và tự gạch nợ khi VietinBank báo có.
                </>
              ) : (
                <>
                  Điền sheet <strong>Thông tin trường</strong> và sheet{" "}
                  <strong>Dữ liệu import</strong>. Khi xác nhận, hệ thống sẽ tự
                  tạo trường, năm học, học kỳ mặc định, lớp và học sinh chưa tồn
                  tại.
                </>
              )}
            </div>
            <form
              className="grid gap-5"
              onSubmit={handleSubmit((values) => {
                preview.mutate(
                  values.mode === "PAYMENT_LIST"
                    ? {
                        file: values.file[0],
                        type: "STUDENTS",
                        schoolId: values.schoolId,
                        academicYearId: academicYear.data?.id,
                        createPaymentOrders: true,
                        qrExpiresAt:
                          values.expiryMode === "DATE"
                            ? values.qrExpiresAt
                            : undefined,
                        serviceName: values.serviceName?.trim() || undefined,
                      }
                    : { file: values.file[0], type: "STUDENTS" },
                );
              })}
            >
              <div>
                <FormField
                  label="File Excel"
                  required
                  error={errors.file?.message as string | undefined}
                  hint={
                    selectedFiles?.[0]
                      ? `Đã chọn: ${selectedFiles[0].name}`
                      : "Hỗ trợ file .xlsx theo mẫu import của hệ thống."
                  }
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
                      accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      className="sr-only"
                      {...register("file")}
                    />
                  </label>
                </FormField>
              </div>
              {mode === "PAYMENT_LIST" ? (
                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField
                    label="Trường"
                    required
                    error={errors.schoolId?.message}
                    hint={
                      !schoolId
                        ? "Học sinh và công nợ được lưu vào trường này."
                        : academicYear.isLoading
                          ? "Đang tải năm học…"
                          : academicYear.data
                            ? `Năm học hiện tại: ${academicYear.data.name}`
                            : "Trường chưa có năm học hiện tại."
                    }
                  >
                    <Controller
                      control={control}
                      name="schoolId"
                      render={({ field }) => (
                        <Select
                          value={field.value ?? ""}
                          onValueChange={field.onChange}
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
                  <FormField
                    label="Thời hạn mã QR"
                    error={errors.qrExpiresAt?.message}
                    hint={
                      expiryMode === "DATE"
                        ? "Hết ngày này, VietinBank từ chối thanh toán mã QR."
                        : "Mã QR dùng được đến khi thanh toán xong."
                    }
                  >
                    <Controller
                      control={control}
                      name="expiryMode"
                      render={({ field }) => (
                        <div className="flex gap-2">
                          {(
                            [
                              ["NONE", "Không thời hạn"],
                              ["DATE", "Đến ngày"],
                            ] as const
                          ).map(([value, label]) => (
                            <Button
                              key={value}
                              type="button"
                              size="sm"
                              variant={
                                field.value === value ? "default" : "outline"
                              }
                              onClick={() => field.onChange(value)}
                            >
                              {label}
                            </Button>
                          ))}
                        </div>
                      )}
                    />
                    {expiryMode === "DATE" ? (
                      <Input
                        type="date"
                        min={todayVn()}
                        className="mt-2"
                        {...register("qrExpiresAt")}
                      />
                    ) : null}
                  </FormField>
                  <div className="sm:col-span-2">
                    <FormField
                      label="Tên dịch vụ trên hóa đơn"
                      htmlFor="serviceName"
                      error={errors.serviceName?.message}
                      hint={`In trên phiếu thu và hóa đơn điện tử, tự thêm năm học: "${
                        serviceName?.trim() || "Học phí"
                      } năm học ${academicYear.data?.name ?? "…"}". Bỏ trống: "Học phí".`}
                    >
                      <Input
                        id="serviceName"
                        placeholder="Học phí"
                        maxLength={200}
                        {...register("serviceName")}
                      />
                    </FormField>
                  </div>
                </div>
              ) : null}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="lg"
                  disabled={
                    preview.isPending ||
                    (mode === "PAYMENT_LIST" &&
                      Boolean(schoolId) &&
                      !academicYear.data)
                  }
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
            <div className="mt-7 grid w-full gap-3 sm:grid-cols-2">
              {[
                ["Trường tạo mới", confirm.data.schoolsCreated],
                ["Năm học tạo mới", confirm.data.academicYearsCreated],
                ["Lớp tạo mới", confirm.data.classesCreated],
                ["HS tạo mới", confirm.data.studentsCreated],
                ["HS đã có", confirm.data.studentsMatched],
                ...(confirm.data.paymentOrdersCreated !== undefined
                  ? [
                      ["Công nợ tạo mới", confirm.data.receivablesCreated],
                      [
                        "Đơn thanh toán (QR VietinBank)",
                        confirm.data.paymentOrdersCreated,
                      ],
                    ]
                  : []),
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-xl bg-slate-50 p-4">
                  <p className="font-display text-2xl font-bold text-slate-950">
                    {value}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              {hasAmounts ? (
                <Button disabled={downloadPdf.isPending} onClick={exportPdf}>
                  <QrCode />
                  {downloadPdf.isPending ? "Đang xuất PDF…" : "Tải PDF mã QR"}
                </Button>
              ) : null}
              <Button variant="outline" onClick={restart}>
                <RotateCcw />
                Import file khác
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {preview.data.target ? (
            <Card className="border-teal-200 bg-teal-50/60">
              <CardContent className="grid gap-3 p-5 text-sm sm:grid-cols-3">
                <SummaryDetail
                  label="Trường"
                  value={`${preview.data.target.schoolName} (${preview.data.target.schoolCode})`}
                  note={
                    preview.data.target.schoolWillBeCreated
                      ? "Sẽ tạo mới"
                      : "Đã tồn tại"
                  }
                />
                <SummaryDetail
                  label="Năm học"
                  value={preview.data.target.academicYearName}
                  note={
                    preview.data.target.academicYearWillBeCreated
                      ? "Sẽ tạo mới"
                      : "Đã tồn tại"
                  }
                />
                <SummaryDetail
                  label="Lớp trong file"
                  value={String(preview.data.target.classesInFile)}
                  note="Sẽ tạo lớp chưa tồn tại"
                />
              </CardContent>
            </Card>
          ) : null}
          {hasAmounts ? (
            <Card className="border-amber-200 bg-amber-50/60">
              <CardContent className="grid gap-3 p-5 text-sm sm:grid-cols-2 lg:grid-cols-5">
                <SummaryDetail
                  label="Danh sách"
                  value={paymentOptions?.title || "—"}
                  note={`${preview.data.validRows} học sinh`}
                />
                {savesDebts ? (
                  <SummaryDetail
                    label="Dịch vụ trên hóa đơn"
                    value={paymentOptions?.serviceName || "Học phí"}
                    note="Hóa đơn tự thêm năm học"
                  />
                ) : null}
                <SummaryDetail
                  label="Tổng tiền"
                  value={`${formatAmount(
                    preview.data.rows.reduce(
                      (sum, row) => sum + Number(row.originalAmount),
                      0,
                    ),
                  )} đ`}
                  note="Theo cột SỐ TIỀN"
                />
                <SummaryDetail
                  label="Hạn mã QR"
                  value={
                    paymentOptions?.qrExpiresAt
                      ? formatImportDate(paymentOptions.qrExpiresAt)
                      : "Không thời hạn"
                  }
                  note={
                    paymentOptions?.qrExpiresAt
                      ? "Hết hạn cuối ngày (giờ VN)"
                      : "Dùng đến khi thanh toán xong"
                  }
                />
                <SummaryDetail
                  label="Gạch nợ"
                  value={savesDebts ? "Tự động qua VietinBank" : "Chỉ xuất PDF"}
                  note={
                    savesDebts
                      ? "Công nợ & đơn tạo khi lưu; QR có sau khi lưu"
                      : "Không tạo công nợ, đơn thanh toán"
                  }
                />
              </CardContent>
            </Card>
          ) : null}
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
            <CardContent className="space-y-6">
              {preview.data.errors.length ? (
                <div>
                  <h4 className="mb-3 font-semibold text-rose-700">
                    Lỗi dữ liệu
                  </h4>
                  <div className="overflow-x-auto">
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
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                  <CheckCircle2 className="size-5" />
                  Không phát hiện lỗi dữ liệu
                </div>
              )}

              {preview.data.rows.length ? (
                <div>
                  <h4 className="mb-3 font-semibold text-slate-900">
                    Dữ liệu học sinh sẽ import ({preview.data.rows.length})
                  </h4>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Dòng</TableHead>
                          <TableHead>Học sinh</TableHead>
                          <TableHead>Mã định danh</TableHead>
                          <TableHead>Ngày sinh</TableHead>
                          <TableHead>Giới tính</TableHead>
                          <TableHead>Lớp</TableHead>
                          <TableHead>Liên hệ học sinh</TableHead>
                          <TableHead>Phụ huynh</TableHead>
                          <TableHead>Liên hệ phụ huynh</TableHead>
                          <TableHead>Địa chỉ</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          {hasAmounts ? (
                            <>
                              <TableHead className="text-right">
                                Số tiền
                              </TableHead>
                              <TableHead>Nội dung chuyển khoản</TableHead>
                            </>
                          ) : null}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {preview.data.rows.map((row) => (
                          <TableRow key={row.rowNumber}>
                            <TableCell className="font-semibold">
                              {row.rowNumber}
                            </TableCell>
                            <TableCell className="min-w-44 font-semibold text-slate-900">
                              {row.fullName}
                            </TableCell>
                            <TableCell className="whitespace-nowrap font-mono text-xs">
                              {row.identifierCode || "—"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {formatImportDate(row.dateOfBirth)}
                            </TableCell>
                            <TableCell>{genderLabel(row.gender)}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              {row.className}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {row.phone || "—"}
                            </TableCell>
                            <TableCell className="min-w-40">
                              {row.parentName || "—"}
                            </TableCell>
                            <TableCell className="min-w-48">
                              <div>{row.parentPhone || "—"}</div>
                              {row.parentEmail ? (
                                <div className="mt-1 text-xs text-slate-500">
                                  {row.parentEmail}
                                </div>
                              ) : null}
                            </TableCell>
                            <TableCell className="min-w-52">
                              {row.address || "—"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <Badge variant="secondary">
                                {studentStatusLabel(row.status)}
                              </Badge>
                            </TableCell>
                            {hasAmounts ? (
                              <>
                                <TableCell className="whitespace-nowrap text-right font-semibold">
                                  {formatAmount(Number(row.originalAmount))}
                                </TableCell>
                                <TableCell className="min-w-64 text-xs">
                                  {row.legacyTransferContent || "Tự sinh HV…"}
                                </TableCell>
                              </>
                            ) : null}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
          <div className="flex justify-between">
            <Button variant="outline" onClick={restart}>
              <RotateCcw />
              Chọn lại file
            </Button>
            <div className="flex flex-wrap justify-end gap-3">
              {/* A payment list's QR is drawn by VietinBank when it is saved. */}
              {hasAmounts && !savesDebts ? (
                <Button
                  variant="outline"
                  disabled={!preview.data.validRows || downloadPdf.isPending}
                  onClick={exportPdf}
                >
                  <QrCode />
                  {downloadPdf.isPending
                    ? "Đang xuất PDF…"
                    : "Tải PDF xem trước"}
                </Button>
              ) : null}
              <Button
                disabled={!preview.data.validRows || confirm.isPending}
                onClick={() =>
                  confirm.mutate(preview.data.importSessionId, {
                    // Saved orders carry the final QR: export the PDF from them.
                    onSuccess: () => {
                      if (savesDebts) exportPdf();
                    },
                  })
                }
              >
                {confirm.isPending
                  ? "Đang import…"
                  : savesDebts
                    ? `Lưu ${preview.data.validRows} học sinh để gạch nợ & xuất PDF`
                    : `Xác nhận import ${preview.data.validRows} dòng`}
              </Button>
            </div>
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

function SummaryDetail({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
        {label}
      </p>
      <p className="mt-1 font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{note}</p>
    </div>
  );
}

function formatImportDate(value: string | null) {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  return day && month && year ? `${day}/${month}/${year}` : value;
}

function genderLabel(value: "MALE" | "FEMALE" | "OTHER" | null) {
  if (value === "MALE") return "Nam";
  if (value === "FEMALE") return "Nữ";
  if (value === "OTHER") return "Khác";
  return "—";
}

function studentStatusLabel(
  value: "ACTIVE" | "INACTIVE" | "GRADUATED" | "TRANSFERRED",
) {
  const labels = {
    ACTIVE: "Đang học",
    INACTIVE: "Ngừng học",
    GRADUATED: "Đã tốt nghiệp",
    TRANSFERRED: "Đã chuyển trường",
  } as const;
  return labels[value];
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}
