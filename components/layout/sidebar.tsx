"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ChartNoAxesCombined,
  ChevronLeft,
  ClipboardList,
  FileClock,
  FileDown,
  FileSpreadsheet,
  GraduationCap,
  Landmark,
  LayoutDashboard,
  ReceiptText,
  RefreshCcw,
  School,
  Settings2,
  Tags,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { can, PERMISSIONS } from "@/lib/permissions";
import { useAuthStore } from "@/stores/auth-store";

type PermissionName = keyof typeof PERMISSIONS;
interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  permission?: PermissionName;
}
interface NavGroup {
  label: string;
  items: NavItem[];
}

const groups: NavGroup[] = [
  {
    label: "Tổng quan",
    items: [{ href: "/", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Hồ sơ",
    items: [
      { href: "/schools", label: "Trường học", icon: School },
      { href: "/classes", label: "Lớp học", icon: GraduationCap },
      { href: "/students", label: "Học sinh", icon: Users },
    ],
  },
  {
    label: "Thu học phí",
    items: [
      { href: "/fee-categories", label: "Danh mục khoản thu", icon: Tags },
      { href: "/fee-plans", label: "Kế hoạch thu", icon: ClipboardList },
      { href: "/receivables", label: "Công nợ", icon: WalletCards },
      { href: "/payment-transactions", label: "Giao dịch", icon: Landmark },
      {
        href: "/reconciliation",
        label: "Đối soát",
        icon: RefreshCcw,
        permission: "accounting",
      },
      { href: "/receipts", label: "Phiếu thu", icon: ReceiptText },
      { href: "/refunds", label: "Hoàn tiền", icon: FileDown },
    ],
  },
  {
    label: "Dữ liệu & báo cáo",
    items: [
      {
        href: "/imports",
        label: "Import Excel",
        icon: FileSpreadsheet,
        permission: "accounting",
      },
      {
        href: "/reports/receivables",
        label: "Báo cáo công nợ",
        icon: BarChart3,
      },
      {
        href: "/reports/classes",
        label: "Báo cáo theo lớp",
        icon: ChartNoAxesCombined,
      },
    ],
  },
  {
    label: "Hệ thống",
    items: [
      {
        href: "/users",
        label: "Người dùng",
        icon: Settings2,
        permission: "userWrite",
      },
      {
        href: "/audit-logs",
        label: "Nhật ký hệ thống",
        icon: FileClock,
        permission: "auditView",
      },
    ],
  },
];

export function Sidebar({
  open,
  collapsed,
  onClose,
  onToggle,
}: {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const role = useAuthStore((state) => state.user?.role);
  return (
    <>
      {open && (
        <button
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-label="Đóng menu"
        />
      )}
      <aside
        className={cn(
          "brand-orbit fixed inset-y-0 left-0 z-50 flex flex-col overflow-hidden bg-[linear-gradient(165deg,#064c3b_0%,#087848_48%,#075c45_100%)] text-white shadow-[14px_0_45px_-28px_rgba(5,76,59,0.9)] transition-all duration-300 lg:sticky lg:top-0 lg:z-20 lg:h-screen",
          collapsed ? "w-[92px]" : "w-[286px]",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="relative flex h-[94px] items-center gap-3 border-b border-[#dfa72f]/25 px-4">
          <div className="relative flex size-[58px] shrink-0 items-center justify-center rounded-full bg-white p-1 shadow-[0_8px_24px_-10px_rgba(0,0,0,0.55)] ring-2 ring-[#dfa72f]/70">
            <Image
              src="/ichi-skill-logo.png"
              alt="Logo ICHI SKILL"
              width={52}
              height={52}
              className="size-full rounded-full object-cover"
              priority
            />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-display text-[17px] font-black tracking-wide text-[#f4c456]">
                ICHI SKILL
              </div>
              <div className="mt-0.5 truncate text-[10px] font-bold tracking-[0.16em] text-white/65">
                KNS · CĐS · STEM
              </div>
            </div>
          )}
          <button
            className="ml-auto rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white lg:hidden"
            onClick={onClose}
          >
            <X className="size-5" />
          </button>
        </div>
        <nav className="scrollbar-thin relative flex-1 overflow-y-auto px-3 py-5">
          {groups.map((group) => {
            const visible = group.items.filter(
              (item) =>
                !item.permission || can(role, PERMISSIONS[item.permission]),
            );
            if (!visible.length) return null;
            return (
              <div key={group.label} className="mb-5">
                {!collapsed && (
                  <p className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#f4c456]/75">
                    {group.label}
                  </p>
                )}
                <div className="space-y-1">
                  {visible.map((item) => {
                    const active =
                      item.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        title={collapsed ? item.label : undefined}
                        className={cn(
                          "group relative flex h-11 items-center gap-3 rounded-[14px] px-3 text-sm font-semibold transition-all",
                          active
                            ? "bg-gradient-to-r from-white to-[#eef7e8] text-[#064c3b] shadow-[0_9px_24px_-14px_rgba(0,0,0,0.75)] ring-1 ring-white/80"
                            : "text-white/72 hover:bg-white/10 hover:text-white",
                          collapsed && "justify-center px-0",
                        )}
                      >
                        <Icon
                          className={cn(
                            "size-[18px] shrink-0",
                            active
                              ? "text-[#237fb5]"
                              : "text-[#b9dcb9] group-hover:text-[#f4c456]",
                          )}
                        />
                        {!collapsed && <span>{item.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
        <button
          onClick={onToggle}
          className="m-3 hidden h-10 items-center justify-center rounded-xl border border-white/15 bg-black/5 text-white/70 hover:border-[#dfa72f]/40 hover:bg-white/10 hover:text-white lg:flex"
        >
          <ChevronLeft
            className={cn(
              "size-4 transition-transform",
              collapsed && "rotate-180",
            )}
          />
          {!collapsed && (
            <span className="ml-2 text-xs font-semibold">Thu gọn</span>
          )}
        </button>
      </aside>
    </>
  );
}
