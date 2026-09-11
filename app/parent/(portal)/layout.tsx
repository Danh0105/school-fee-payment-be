import type { ReactNode } from "react";
import { ParentAuthGuard } from "@/features/parent-portal/components/parent-auth-guard";

export default function ProtectedParentLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <ParentAuthGuard>{children}</ParentAuthGuard>;
}
