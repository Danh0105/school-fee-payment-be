"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ShieldCheck, UserPlus } from "lucide-react";
import { z } from "zod";
import { FormField } from "@/components/form-field";
import { PageHeader } from "@/components/page-header";
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
import { useSchools } from "@/features/schools/hooks";
import { useCreateUser } from "@/features/users/hooks";
import type { CreateUserPayload } from "@/features/users/api";

const schema = z.object({
  email: z.email("Email chưa đúng định dạng"),
  password: z.string().min(8, "Mật khẩu cần ít nhất 8 ký tự"),
  fullName: z.string().trim().min(1, "Họ tên là bắt buộc"),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "ACCOUNTANT", "CASHIER", "VIEWER"]),
  schoolId: z.union([z.literal(""), z.uuid()]).optional(),
});
type Values = z.infer<typeof schema>;
const roleLabels = {
  SUPER_ADMIN: "Quản trị hệ thống",
  ADMIN: "Quản trị trường",
  ACCOUNTANT: "Kế toán",
  CASHIER: "Thu quỹ",
  VIEWER: "Chỉ xem",
};
export default function UsersPage() {
  const schools = useSchools({ limit: 200 });
  const createUser = useCreateUser();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      role: "VIEWER",
      schoolId: "",
    },
  });
  return (
    <>
      <PageHeader
        eyebrow="Quản trị hệ thống"
        title="Tạo người dùng"
        description="Cấp tài khoản và vai trò đúng với phạm vi công việc. Backend hiện chỉ cung cấp API tạo mới, chưa có API danh sách hoặc chỉnh sửa người dùng."
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="size-5 text-teal-700" />
              Thông tin tài khoản
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={handleSubmit((values) =>
                createUser.mutate(
                  {
                    ...values,
                    schoolId: values.schoolId || undefined,
                  } as CreateUserPayload,
                  { onSuccess: () => reset() },
                ),
              )}
            >
              <FormField
                label="Họ và tên"
                required
                error={errors.fullName?.message}
              >
                <Input {...register("fullName")} />
              </FormField>
              <FormField label="Email" required error={errors.email?.message}>
                <Input type="email" autoComplete="off" {...register("email")} />
              </FormField>
              <FormField
                label="Mật khẩu khởi tạo"
                required
                hint="Tối thiểu 8 ký tự"
                error={errors.password?.message}
              >
                <Input
                  type="password"
                  autoComplete="new-password"
                  {...register("password")}
                />
              </FormField>
              <FormField label="Vai trò" required error={errors.role?.message}>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(roleLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <div className="sm:col-span-2">
                <FormField
                  label="Trường phụ trách"
                  hint="Có thể bỏ trống cho SUPER_ADMIN/ADMIN quản lý nhiều trường."
                  error={errors.schoolId?.message}
                >
                  <Controller
                    name="schoolId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Không giới hạn trường" />
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
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <Button type="submit" disabled={createUser.isPending}>
                  {createUser.isPending ? "Đang tạo…" : "Tạo tài khoản"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <Card className="border-transparent bg-[linear-gradient(145deg,#054c3b,#078247)] text-white">
          <CardContent className="p-6">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-white/10 text-[#f4c456]">
              <ShieldCheck className="size-6" />
            </span>
            <h3 className="mt-5 font-display text-xl font-bold">
              Nguyên tắc phân quyền
            </h3>
            <div className="mt-5 space-y-4">
              {Object.entries(roleLabels).map(([role, label]) => (
                <div
                  key={role}
                  className="border-b border-white/10 pb-3 last:border-0"
                >
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="mt-1 text-xs text-teal-50/55">
                    {role === "VIEWER"
                      ? "Chỉ xem, không có thao tác ghi."
                      : role === "CASHIER"
                        ? "Tạo đơn và ghi nhận tiền mặt."
                        : role === "ACCOUNTANT"
                          ? "Nghiệp vụ công nợ, đối soát và báo cáo."
                          : "Quản lý danh mục và người dùng."}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
