"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { CurrentAcademicYearBadge } from "@/components/current-academic-year-badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrentAcademicYear } from "@/features/academic-years/hooks";
import { useClasses } from "@/features/classes/hooks";
import { useSchools } from "@/features/schools/hooks";
import { getErrorMessage } from "@/lib/error-messages";
import { queryKeys } from "@/lib/query-keys";
import { omitEmpty, optionalText, requiredText, uuid } from "@/lib/validation";
import { studentsApi, type StudentPayload } from "../api";

const schema = z.object({
  schoolId: uuid("trường"),
  classId: uuid("lớp"),
  fullName: requiredText("Họ và tên"),
  identifierCode: optionalText,
  dateOfBirth: requiredText("Ngày sinh"),
  phone: optionalText,
  address: optionalText,
  parentName: optionalText,
  parentPhone: z
    .string()
    .trim()
    .min(9, "Số điện thoại phụ huynh chưa hợp lệ")
    .max(20, "Số điện thoại phụ huynh chưa hợp lệ")
    .regex(/^\+?[0-9 .-]+$/, "Số điện thoại phụ huynh chưa hợp lệ"),
  parentEmail: z
    .union([z.literal(""), z.email("Email phụ huynh chưa hợp lệ")])
    .optional(),
});
type Values = z.infer<typeof schema>;

export function StudentCreateDialog({
  schoolId,
  classId = "",
}: {
  schoolId: string;
  classId?: string;
}) {
  const [open, setOpen] = useState(false);
  const client = useQueryClient();
  const schools = useSchools({ limit: 200, sortBy: "name", sortOrder: "ASC" });
  const defaults = useMemo<Values>(
    () => ({
      schoolId,
      classId,
      fullName: "",
      identifierCode: "",
      dateOfBirth: "",
      phone: "",
      address: "",
      parentName: "",
      parentPhone: "",
      parentEmail: "",
    }),
    [schoolId, classId],
  );
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });
  useEffect(() => {
    if (open) reset(defaults);
  }, [open, reset, defaults]);
  const currentYear = useCurrentAcademicYear(schoolId || undefined);
  const classes = useClasses(
    {
      limit: 200,
      schoolId: schoolId || undefined,
      academicYearId: currentYear.data?.id,
      sortBy: "name",
      sortOrder: "ASC",
    },
    Boolean(schoolId && currentYear.data),
  );
  const noClasses =
    Boolean(schoolId) &&
    Boolean(currentYear.data) &&
    !classes.isLoading &&
    (classes.data?.data.length ?? 0) === 0;
  const mutation = useMutation({
    mutationFn: async (values: Values) => {
      if (!currentYear.data) {
        throw new Error("Chưa xác định được năm học hiện tại");
      }
      const payload = omitEmpty({
        schoolId: values.schoolId,
        fullName: values.fullName,
        identifierCode: values.identifierCode,
        dateOfBirth: values.dateOfBirth,
        phone: values.phone,
        address: values.address,
        parentName: values.parentName,
        parentPhone: values.parentPhone,
        parentEmail: values.parentEmail,
      }) as StudentPayload;
      const student = await studentsApi.create(payload);
      await studentsApi.assignClass({
        studentId: student.id,
        classId: values.classId,
        academicYearId: currentYear.data.id,
      });
      return student;
    },
    onSuccess: (student) => {
      toast.success(`Đã tạo học sinh với mã ${student.studentCode}`);
      void client.invalidateQueries({ queryKey: queryKeys.students });
      void client.invalidateQueries({ queryKey: queryKeys.classes });
      setOpen(false);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={!schoolId || !currentYear.data}>
          <Plus />
          Thêm học sinh
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Thêm học sinh</DialogTitle>
          <DialogDescription>
            Hệ thống tự sinh mã học sinh chính thức sau khi tạo hồ sơ.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Trường" required error={errors.schoolId?.message}>
              <Controller
                name="schoolId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    disabled={Boolean(schoolId)}
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

            <div className="sm:col-span-2">
              <FormField
                label="Lớp"
                required
                error={errors.classId?.message}
                hint={
                  classId
                    ? "Đã chọn theo bộ lọc lớp bên ngoài."
                    : noClasses
                      ? 'Trường chưa có lớp nào cho năm học hiện tại — vào mục "Lớp học" để tạo lớp trước.'
                      : undefined
                }
              >
                <Controller
                  name="classId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                      disabled={
                        Boolean(classId) ||
                        !currentYear.data ||
                        classes.isLoading
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            classes.isLoading ? "Đang tải lớp…" : "Chọn lớp"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.data?.data.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                            {item.grade ? ` · Khối ${item.grade}` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
            </div>

            <FormField
              label="Họ và tên"
              required
              error={errors.fullName?.message}
            >
              <Input
                placeholder="Nhập họ và tên học sinh"
                {...register("fullName")}
              />
            </FormField>

            <FormField
              label="Mã định danh"
              error={errors.identifierCode?.message}
            >
              <Input
                placeholder="0123456789012"
                {...register("identifierCode")}
              />
            </FormField>

            <FormField
              label="Ngày sinh"
              required
              error={errors.dateOfBirth?.message}
              hint="Mật khẩu đăng nhập phụ huynh là ngày sinh theo dạng DDMMYYYY."
            >
              <Input type="date" {...register("dateOfBirth")} />
            </FormField>

            <FormField label="Số điện thoại" error={errors.phone?.message}>
              <Input {...register("phone")} />
            </FormField>

            <FormField label="Tên phụ huynh" error={errors.parentName?.message}>
              <Input {...register("parentName")} />
            </FormField>

            <FormField
              label="SĐT tài khoản phụ huynh"
              required
              error={errors.parentPhone?.message}
              hint="Số điện thoại này được dùng làm tên đăng nhập."
            >
              <Input
                type="tel"
                autoComplete="tel"
                placeholder="Nhập số điện thoại phụ huynh"
                {...register("parentPhone")}
              />
            </FormField>

            <FormField
              label="Email phụ huynh"
              error={errors.parentEmail?.message}
            >
              <Input type="email" {...register("parentEmail")} />
            </FormField>

            <div className="sm:col-span-2">
              <FormField label="Địa chỉ" error={errors.address?.message}>
                <Input {...register("address")} />
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
              {mutation.isPending ? "Đang tạo…" : "Tạo học sinh"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
