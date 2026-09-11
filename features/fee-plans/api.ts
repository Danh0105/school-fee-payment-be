import { apiRequest } from "@/lib/api-client";
import { crudApi } from "@/features/shared/crud";
import type { FeePlan } from "@/lib/types";
export type FeePlanStatus = "DRAFT" | "ACTIVE" | "CLOSED" | "CANCELLED";
export interface CreateFeePlanPayload {
  schoolId: string;
  feeCategoryId: string;
  unitPrice: string;
  quantity: string;
  description?: string;
  status?: FeePlanStatus;
}
export interface UpdateFeePlanPayload {
  semesterId?: string;
  name?: string;
  billingType?: "ONE_TIME" | "MONTHLY" | "CUSTOM";
  unitPrice?: string;
  quantity?: string;
  description?: string;
  startDate?: string;
  dueDate?: string;
  status?: FeePlanStatus;
}
export interface AssignFeePlanPayload {
  targetType: "SCHOOL" | "GRADE" | "CLASS" | "STUDENT";
  classIds?: string[];
  studentIds?: string[];
  grade?: string;
}
export interface AssignFeePlanResult {
  targetedStudents: number;
  receivablesCreated: number;
  receivablesSkipped: number;
}
export const feePlansApi = {
  ...crudApi<FeePlan, CreateFeePlanPayload, UpdateFeePlanPayload>("/fee-plans"),
  assign: (id: string, payload: AssignFeePlanPayload) =>
    apiRequest<AssignFeePlanResult>({
      method: "POST",
      url: `/fee-plans/${id}/assign`,
      data: payload,
    }),
};
