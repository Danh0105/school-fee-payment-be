import type { Role } from "@/lib/types";

export const PERMISSIONS = {
  catalogWrite: ["SUPER_ADMIN", "ADMIN"],
  catalogDelete: ["SUPER_ADMIN"],
  studentWrite: ["SUPER_ADMIN", "ADMIN"],
  feeWrite: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"],
  feeDelete: ["SUPER_ADMIN", "ADMIN"],
  collect: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT", "CASHIER"],
  accounting: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"],
  userWrite: ["SUPER_ADMIN", "ADMIN"],
  auditView: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"],
} as const satisfies Record<string, readonly Role[]>;

export function can(
  role: Role | undefined | null,
  allowed: readonly Role[],
): boolean {
  if (!role) return false;
  const normalizedRole = String(role).trim().toUpperCase() as Role;
  return allowed.includes(normalizedRole);
}
