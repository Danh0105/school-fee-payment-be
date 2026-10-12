"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm, useWatch } from "react-hook-form";
import { ArrowRight, BadgeCheck, KeyRound, Search } from "lucide-react";
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
import type { ParentStudentLookupCandidate } from "@/lib/types";
import { useParentSessionStore } from "@/stores/parent-session-store";

const searchSchema = z.object({
  schoolId: z.string().min(1, "Vui lòng chọn trường."),
  fullName: z
    .string()
    .trim()
    .min(3, "Vui lòng nhập ít nhất 3 ký tự trong họ tên học sinh."),
});
type SearchValues = z.infer<typeof searchSchema>;

export default function ParentAccessPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const hydrated = useParentSessionStore((state) => state.hydrated);
  const accessToken = useParentSessionStore((state) => state.accessToken);
  const setSession = useParentSessionStore((state) => state.setSession);
  const schools = useParentSchools();
  const [candidates, setCandidates] = useState<ParentStudentLookupCandidate[]>(
    [],
  );
  const [selectedToken, setSelectedToken] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: { schoolId: "", fullName: "" },
  });
  const schoolId = useWatch({ control, name: "schoolId" });

  const resetLookup = () => {
    setCandidates([]);
    setSelectedToken("");
    setPassword("");
    setPasswordError("");
  };

  const searchMutation = useMutation({
    mutationFn: (values: SearchValues) => parentPortalApi.search(values),
    onSuccess: (results) => {
      setCandidates(results);
      setSelectedToken(results.length === 1 ? results[0].lookupToken : "");
      setPassword("");
      setPasswordError("");
    },
  });
  const verifyMutation = useMutation({
    mutationFn: () =>
      parentPortalApi.verify({ lookupToken: selectedToken, password }),
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
      <div className="mx-auto h-[620px] max-w-xl animate-pulse rounded-[32px] bg-white/60" />
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
          Đăng nhập để xem
          <br />
          thông tin và học phí
        </h1>
      </div>

      <div className="space-y-6 px-6 py-8 sm:px-10">
        <form
          className="space-y-5"
          onSubmit={handleSubmit((values) => searchMutation.mutate(values))}
        >
          <div>
            <label
              htmlFor="schoolId"
              className="text-sm font-bold text-slate-800"
            >
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
                      resetLookup();
                      searchMutation.reset();
                      verifyMutation.reset();
                    }}
                    disabled={schools.isLoading}
                  >
                    <SelectTrigger id="schoolId" className="h-12 text-base">
                      <SelectValue
                        placeholder={
                          schools.isLoading
                            ? "Đang tải danh sách trường…"
                            : "Chọn trường"
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
              <p
                className="mt-2 text-sm font-medium text-rose-600"
                role="alert"
              >
                Không tải được danh sách trường.{" "}
                {getErrorMessage(schools.error)}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="fullName"
              className="text-sm font-bold text-slate-800"
            >
              Họ và tên học sinh
            </label>
            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="fullName"
                autoComplete="name"
                autoFocus
                placeholder="Nguyễn Văn A"
                className="h-12 pl-10 text-base"
                aria-invalid={Boolean(errors.fullName)}
                {...register("fullName", {
                  onChange: () => {
                    resetLookup();
                    searchMutation.reset();
                    verifyMutation.reset();
                  },
                })}
              />
            </div>
            {errors.fullName?.message && (
              <p className="mt-2 text-sm font-medium text-rose-600">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={searchMutation.isPending || !schoolId}
          >
            {searchMutation.isPending ? "Đang tìm…" : "Tìm học sinh"}
            {!searchMutation.isPending && <Search />}
          </Button>
          {searchMutation.error && (
            <p className="text-sm font-medium text-rose-600" role="alert">
              {getErrorMessage(searchMutation.error)}
            </p>
          )}
        </form>

        {searchMutation.isSuccess && candidates.length === 0 && (
          <p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
            Không tìm thấy học sinh phù hợp. Vui lòng kiểm tra lại trường và họ
            tên.
          </p>
        )}

        {candidates.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-bold text-slate-800">
              Chọn đúng hồ sơ học sinh
            </p>
            {candidates.map((candidate) => {
              const selected = selectedToken === candidate.lookupToken;
              return (
                <button
                  key={candidate.lookupToken}
                  type="button"
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selected
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-slate-200 hover:border-emerald-300"
                  }`}
                  onClick={() => {
                    setSelectedToken(candidate.lookupToken);
                    setPassword("");
                    setPasswordError("");
                    verifyMutation.reset();
                  }}
                >
                  <span className="block font-bold text-slate-900">
                    {candidate.displayName}
                  </span>
                  <span className="mt-1 block text-sm text-slate-500">
                    Ngày sinh: {candidate.dateOfBirthHint ?? "Chưa cập nhật"}
                    {candidate.parentPhoneHint
                      ? ` · SĐT phụ huynh: ${candidate.parentPhoneHint}`
                      : ""}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {selectedToken && (
          <form
            className="space-y-4 border-t border-slate-100 pt-6"
            onSubmit={(event) => {
              event.preventDefault();
              if (password.length < 8) {
                setPasswordError("Mật khẩu cần ít nhất 8 ký tự.");
                return;
              }
              setPasswordError("");
              verifyMutation.mutate();
            }}
          >
            <div>
              <label
                htmlFor="parentPassword"
                className="text-sm font-bold text-slate-800"
              >
                Mật khẩu tài khoản
              </label>
              <div className="relative mt-2">
                <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="parentPassword"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setPasswordError("");
                    verifyMutation.reset();
                  }}
                  aria-invalid={Boolean(passwordError || verifyMutation.error)}
                  className="h-12 pl-10 text-base"
                />
              </div>
              {passwordError && (
                <p className="mt-2 text-sm font-medium text-rose-600">
                  {passwordError}
                </p>
              )}
              {!passwordError && verifyMutation.error && (
                <p
                  className="mt-2 text-sm font-medium text-rose-600"
                  role="alert"
                >
                  {getErrorMessage(verifyMutation.error)}
                </p>
              )}
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={verifyMutation.isPending}
            >
              {verifyMutation.isPending ? "Đang đăng nhập…" : "Đăng nhập"}
              {!verifyMutation.isPending && <ArrowRight />}
            </Button>
          </form>
        )}

        <div className="flex gap-3 rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
          <BadgeCheck className="mt-0.5 size-5 shrink-0 text-emerald-700" />
          <p>
            Thông tin và học phí chỉ được hiển thị sau khi mật khẩu của hồ sơ
            học sinh được xác minh.
          </p>
        </div>
      </div>
    </div>
  );
}
