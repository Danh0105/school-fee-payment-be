"use client";

import { useState } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/form-field";
import { useLogin } from "@/features/auth/hooks";

const schema = z.object({
  email: z.email("Email chưa đúng định dạng"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});
type FormValues = z.infer<typeof schema>;

const demoAccounts = [
  {
    label: "Quản trị",
    email: "admin@kimdong.edu.vn",
    password: "Admin@123456",
  },
  {
    label: "Kế toán",
    email: "ketoan@kimdong.edu.vn",
    password: "KeToan@123456",
  },
  {
    label: "Thu quỹ",
    email: "thuquy@kimdong.edu.vn",
    password: "ThuQuy@123456",
  },
];

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const login = useLogin();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <div className="relative w-full max-w-[450px] overflow-hidden rounded-[30px] border border-[#078247]/12 bg-white/95 p-7 shadow-[0_30px_90px_-34px_rgba(5,76,59,0.5)] backdrop-blur sm:p-9">
      <div className="absolute inset-x-8 top-0 h-1 bg-gradient-to-r from-[#078247] via-[#dfa72f] to-[#237fb5]" />
      <div className="mb-8">
        <div className="mb-5 flex items-center gap-3 lg:hidden">
          <div className="flex size-14 items-center justify-center rounded-full bg-white p-1 shadow-md ring-2 ring-[#078247]/25">
            <Image
              src="/ichi-skill-logo.png"
              alt="Logo ICHI SKILL"
              width={52}
              height={52}
              className="size-full rounded-full object-cover"
              priority
            />
          </div>
          <div>
            <p className="font-display text-base font-black tracking-wide text-[#078247]">
              ICHI SKILL
            </p>
            <p className="text-[9px] font-bold tracking-[0.18em] text-[#237fb5]">
              KNS · CĐS · STEM
            </p>
          </div>
        </div>
        <div className="mb-5 hidden size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#237fb5] to-[#078247] text-white shadow-lg shadow-[#078247]/20 lg:flex">
          <ShieldCheck className="size-6" />
        </div>
        <p className="mb-2 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#237fb5]">
          <span className="h-1.5 w-5 rounded-full bg-[#dfa72f]" />
          Cổng quản trị học phí
        </p>
        <h1 className="font-display text-3xl font-black tracking-tight text-[#123f36]">
          Chào mừng trở lại
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#657b75]">
          Đăng nhập để tiếp tục quản lý công nợ và thu học phí.
        </p>
      </div>

      <form
        className="space-y-5"
        onSubmit={handleSubmit((values) => login.mutate(values))}
      >
        <FormField
          label="Email"
          htmlFor="email"
          required
          error={errors.email?.message}
        >
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#237fb5]" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              className="h-12 pl-10"
              placeholder="ten@truong.edu.vn"
              {...register("email")}
            />
          </div>
        </FormField>
        <FormField
          label="Mật khẩu"
          htmlFor="password"
          required
          error={errors.password?.message}
        >
          <div className="relative">
            <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#237fb5]" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className="h-12 px-10"
              placeholder="Nhập mật khẩu"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </FormField>
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={login.isPending}
        >
          {login.isPending ? "Đang xác thực…" : "Đăng nhập"}
        </Button>
      </form>

      <div className="mt-7 border-t border-[#078247]/8 pt-5">
        <p className="mb-3 text-xs font-semibold text-slate-500">
          Tài khoản dùng thử
        </p>
        <div className="grid grid-cols-3 gap-2">
          {demoAccounts.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => {
                setValue("email", account.email, { shouldValidate: true });
                setValue("password", account.password, {
                  shouldValidate: true,
                });
              }}
              className="rounded-xl border border-[#078247]/12 bg-[#f7faf4] px-2 py-2.5 text-xs font-bold text-[#58736d] transition hover:border-[#237fb5]/30 hover:bg-[#eaf4f9] hover:text-[#155e92]"
            >
              {account.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
