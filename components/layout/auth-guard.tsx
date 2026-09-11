"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth-store";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const hydrated = useAuthStore((state) => state.hydrated);
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(() => {
    if (hydrated && !user) {
      // Clear a stale route-guard cookie so /login is not redirected back here.
      clearSession();
      router.replace("/login");
    }
  }, [clearSession, hydrated, user, router]);

  if (!hydrated || !user) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Skeleton className="m-4 hidden w-64 rounded-3xl lg:block" />
        <div className="flex-1 space-y-5 p-6">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }
  return children;
}
