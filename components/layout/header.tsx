"use client";

import { usePathname } from "next/navigation";
import { Bell, ChevronDown, LogOut, Menu, School } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useAuthStore } from "@/stores/auth-store";
import { useLogout } from "@/features/auth/hooks";

const titles: Record<string, string> = {
  "/": "Tổng quan thu học phí",
  "/schools": "Trường học",
  "/classes": "Lớp học",
  "/students": "Học sinh",
  "/fee-categories": "Danh mục khoản thu",
  "/fee-plans": "Kế hoạch thu",
  "/receivables": "Công nợ học sinh",
  "/payment-transactions": "Giao dịch thanh toán",
  "/reconciliation": "Đối soát giao dịch",
  "/receipts": "Phiếu thu",
  "/refunds": "Hoàn tiền",
  "/imports": "Import dữ liệu",
  "/reports/receivables": "Báo cáo công nợ",
  "/reports/classes": "Báo cáo theo lớp",
  "/users": "Quản trị người dùng",
  "/audit-logs": "Nhật ký hệ thống",
};

export function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const base = Object.keys(titles)
    .filter((key) => key !== "/" && pathname.startsWith(key))
    .sort((a, b) => b.length - a.length)[0];
  const title = pathname === "/" ? titles["/"] : (titles[base] ?? "ICHI SKILL");
  const initials = user?.fullName
    .split(" ")
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-[94px] items-center justify-between border-b border-[#078247]/10 bg-white/88 px-4 shadow-[0_10px_35px_-28px_rgba(5,76,59,0.45)] backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMenu}
          className="rounded-xl border border-[#078247]/15 bg-white p-2.5 text-[#075f3b] shadow-sm lg:hidden"
        >
          <Menu className="size-5" />
        </button>
        <div>
          <p className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#237fb5]">
            <span className="size-1.5 rounded-full bg-[#dfa72f]" />
            ICHI SKILL · Tài chính học đường
          </p>
          <h1 className="mt-1 font-display text-lg font-extrabold text-[#123f36] sm:text-xl">
            {title}
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        {user?.schoolId && (
          <div className="hidden items-center gap-2 rounded-xl border border-[#078247]/12 bg-[#f3f8f1] px-3 py-2 text-xs font-bold text-[#4e7168] md:flex">
            <School className="size-4 text-[#237fb5]" />
            Trường của tôi
          </div>
        )}
        <button className="relative rounded-xl border border-[#dfa72f]/25 bg-[#fffaf0] p-2.5 text-[#9c6c08] shadow-sm transition hover:border-[#dfa72f]/50 hover:bg-[#fff5dc]">
          <Bell className="size-4" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#237fb5] ring-2 ring-white" />
        </button>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-2 rounded-xl border border-[#078247]/12 bg-white py-1.5 pl-1.5 pr-2 shadow-sm outline-none transition hover:border-[#237fb5]/35">
              <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#237fb5] to-[#078247] text-xs font-extrabold text-white">
                {initials}
              </span>
              <span className="hidden max-w-32 text-left sm:block">
                <span className="block truncate text-xs font-bold text-slate-800">
                  {user?.fullName}
                </span>
                <span className="block text-[10px] text-slate-400">
                  {user?.role}
                </span>
              </span>
              <ChevronDown className="size-3.5 text-slate-400" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={6}
              className="z-50 min-w-52 rounded-2xl border border-[#078247]/15 bg-white p-1.5 shadow-[0_20px_55px_-20px_rgba(5,76,59,0.4)]"
            >
              <div className="border-b border-slate-100 px-3 py-2 sm:hidden">
                <p className="text-sm font-bold text-slate-800">
                  {user?.fullName}
                </p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              <DropdownMenu.Item
                onSelect={() => logout.mutate()}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 outline-none hover:bg-rose-50"
              >
                <LogOut className="size-4" />
                Đăng xuất
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
