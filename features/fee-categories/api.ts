import { crudApi } from "@/features/shared/crud";
import type { FeeCategory } from "@/lib/types";
export interface FeeCategoryPayload {
  schoolId: string;
  code: string;
  name: string;
  description?: string;
  accountingCode?: string;
  status?: "ACTIVE" | "INACTIVE";
}
export const feeCategoriesApi = crudApi<FeeCategory, FeeCategoryPayload>(
  "/fee-categories",
);
