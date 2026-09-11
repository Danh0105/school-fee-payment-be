"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useParentSessionStore } from "@/stores/parent-session-store";

export function ParentAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const hydrated = useParentSessionStore((state) => state.hydrated);
  const accessToken = useParentSessionStore((state) => state.accessToken);

  useEffect(() => {
    if (hydrated && !accessToken) router.replace("/parent");
  }, [accessToken, hydrated, router]);

  if (!hydrated || !accessToken) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  return children;
}
