"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParentSessionStore } from "@/stores/parent-session-store";

export function ParentHeader() {
  const router = useRouter();
  const hydrated = useParentSessionStore((state) => state.hydrated);
  const accessToken = useParentSessionStore((state) => state.accessToken);
  const clearSession = useParentSessionStore((state) => state.clearSession);

  const changeStudent = () => {
    clearSession();
    router.replace("/parent");
  };

  return (
    <header className="border-b border-emerald-900/10 bg-white/90 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-3xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/parent" className="flex min-w-0 items-center gap-3">
          <Image
            src="/ichi-skill-logo.png"
            alt="ICHI SKILL"
            width={38}
            height={38}
            priority
            className="size-9 rounded-xl object-contain"
          />
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-extrabold text-[#123f36]">
              Thanh toán học phí
            </p>
            <p className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
              <ShieldCheck className="size-3" /> Cổng dành cho phụ huynh
            </p>
          </div>
        </Link>
        {hydrated && accessToken ? (
          <Button variant="ghost" size="sm" onClick={changeStudent}>
            <LogOut />
            Đổi học sinh
          </Button>
        ) : (
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Dành cho nhà trường</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
