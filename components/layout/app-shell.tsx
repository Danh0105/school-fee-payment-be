"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldX } from "lucide-react";
import { AuthGuard } from "@/components/layout/auth-guard";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { can, PERMISSIONS } from "@/lib/permissions";
import { useAuthStore } from "@/stores/auth-store";

const routePermissions = [
  { prefix: "/users", allowed: PERMISSIONS.userWrite },
  { prefix: "/audit-logs", allowed: PERMISSIONS.auditView },
  { prefix: "/imports", allowed: PERMISSIONS.accounting },
  { prefix: "/reconciliation", allowed: PERMISSIONS.accounting },
] as const;

function RoleBoundary({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const role = useAuthStore((state) => state.user?.role);
  const rule = routePermissions.find(({ prefix }) =>
    pathname.startsWith(prefix),
  );

  if (rule && !can(role, rule.allowed)) {
    return (
      <div className="flex min-h-[65vh] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 text-center shadow-sm">
        <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <ShieldX className="size-8" />
        </div>
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Không có quyền truy cập
        </h1>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
          Vai trò hiện tại không được phép mở chức năng này. Backend vẫn là lớp
          kiểm soát quyền cuối cùng.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Về trang tổng quan</Link>
        </Button>
      </div>
    );
  }

  return children;
}

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  return (
    <AuthGuard>
      <div className="brand-grid min-h-screen bg-transparent lg:flex">
        <Sidebar
          open={mobileOpen}
          collapsed={collapsed}
          onClose={() => setMobileOpen(false)}
          onToggle={() => setCollapsed((value) => !value)}
        />
        <div className="min-w-0 flex-1">
          <Header onOpenMenu={() => setMobileOpen(true)} />
          <main className="mx-auto w-full max-w-[1640px] p-4 sm:p-6 lg:p-8">
            <RoleBoundary>{children}</RoleBoundary>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
