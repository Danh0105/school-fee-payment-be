"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm, useWatch } from "react-hook-form";
import { ArrowRight, BadgeCheck, Search } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parentPortalApi } from "@/features/parent-portal/api";
import { useParentSchools } from "@/features/parent-portal/hooks";
import { getErrorMessage } from "@/lib/error-messages";
import { queryKeys } from "@/lib/query-keys";
import { useParentSessionStore } from "@/stores/parent-session-store";

const schema = z.object({
  schoolId: z.string().min(1, "Vui lòng chọn trường."),
  identifierCode: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập mã định danh của học sinh."),
});
type Values = z.infer<typeof schema>;

export default function ParentAccessPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const hydrated = useParentSessionStore((state) => state.hydrated);
  const accessToken = useParentSessionStore((state) => state.accessToken);
  const setSession = useParentSessionStore((state) => state.setSession);
  const schools = useParentSchools();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { schoolId: "", identifierCode: "" },
  });
  const schoolId = useWatch({ control, name: "schoolId" });
  const mutation = useMutation({
    mutationFn: (values: Values) => parentPortalApi.access(values),
    onSuccess: (session) => {
      queryClient.removeQueries({ queryKey: queryKeys.parentPortal });
      setSession(session);
      router.replace("/parent/receivables");
    },
  });

  useEffect(() => {
    if (hydrated && accessToken) router.replace("/parent/receivables");
  }, [accessToken, hydrated, router]);

  if (!hydrated || accessToken) {
    return (
      <div className="mx-auto h-[560px] max-w-xl animate-pulse rounded-[32px] bg-white/60" />
    );
  }

  return (
    <div className="mx-auto max-w-xl overflow-hidden rounded-[32px] border border-emerald-900/10 bg-white shadow-[0_28px_80px_-40px_rgba(5,76,59,0.55)]">
      <div className="relative overflow-hidden bg-[#075f3b] px-6 py-9 text-white sm:px-10">
        <div className="absolute -right-16 -top-20 size-52 rounded-full border border-white/10" />
        <div className="absolute -bottom-24 -left-16 size-48 rounded-full bg-lime-300/10" />
        <Image
          src="/ichi-skill-logo.png"
          alt="ICHI SKILL"
          width={64}
          height={64}
          priority
          className="relative size-16 rounded-2xl bg-white object-contain p-1 shadow-lg"
        />
        <p className="relative mt-6 text-sm font-bold text-emerald-100">
          Cổng thanh toán dành cho phụ huynh
        </p>
        <h1 className="relative mt-2 font-display text-3xl font-extrabold leading-tight">
          Tra cứu học phí
          <br />
          nhanh chóng, an toàn
        </h1>
      </div>
      <form
        className="space-y-5 px-6 py-8 sm:px-10"
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
      >
        <div>
          <label htmlFor="schoolId" className="text-sm font-bold text-slate-800">
            Trường
          </label>
          <div className="mt-2">
            <Controller
              name="schoolId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || undefined}
                  onValueChange={(value) => {
                    field.onChange(value);
                    mutation.reset();
                  }}
                  disabled={schools.isLoading}
                >
                  <SelectTrigger id="schoolId" className="h-12 text-base">
                    <SelectValue
                      placeholder={
                        schools.isLoading ? "Đang tải danh sách trường…" : "Chọn trường"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.data?.map((school) => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          {errors.schoolId?.message && (
            <p className="mt-2 text-sm font-medium text-rose-600">
              {errors.schoolId.message}
            </p>
          )}
          {schools.error && (
            <p className="mt-2 text-sm font-medium text-rose-600" role="alert">
              Không tải được danh sách trường. {getErrorMessage(schools.error)}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="identifierCode"
            className="text-sm font-bold text-slate-800"
          >
            Mã định danh học sinh (CCCD)
          </label>
          <div className="relative mt-2">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="identifierCode"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              autoFocus
              placeholder="Nhập mã định danh"
              aria-invalid={Boolean(errors.identifierCode || mutation.error)}
              className="h-12 pl-10 text-base"
              {...register("identifierCode", {
                onChange: () => mutation.reset(),
              })}
            />
          </div>
          {errors.identifierCode?.message && (
            <p className="mt-2 text-sm font-medium text-rose-600">
              {errors.identifierCode.message}
            </p>
          )}
          {!errors.identifierCode && !errors.schoolId && mutation.error && (
            <p className="mt-2 text-sm font-medium text-rose-600" role="alert">
              {getErrorMessage(mutation.error)}
            </p>
          )}
        </div>
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={mutation.isPending || !schoolId}
        >
          {mutation.isPending ? "Đang tra cứu…" : "Tra cứu công nợ"}
          {!mutation.isPending && <ArrowRight />}
        </Button>
        <div className="flex gap-3 rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
          <BadgeCheck className="mt-0.5 size-5 shrink-0 text-emerald-700" />
          <p>
            Không cần tài khoản hay mật khẩu. Mỗi lần tra cứu chỉ hiển thị thông
            tin của một học sinh.
          </p>
        </div>
      </form>
    </div>
  );
}
