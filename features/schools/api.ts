import { crudApi } from "@/features/shared/crud";
import type { School } from "@/lib/types";

export interface SchoolPayload {
  companyId?: string;
  name: string;
  address?: string;
  phone?: string;
  taxCode?: string;
  managerInfo?: string;
  salesRepresentative?: string;
  status?: "ACTIVE" | "INACTIVE";
}
export const schoolsApi = crudApi<School, SchoolPayload>("/schools");
