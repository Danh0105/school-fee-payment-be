import { apiRequest } from "@/lib/api-client";
import { crudApi } from "@/features/shared/crud";
import type { SchoolClass, Student } from "@/lib/types";
export interface ClassPayload {
  schoolId: string;
  name: string;
  grade?: string;
  status?: "ACTIVE" | "INACTIVE";
}
export const classesApi = {
  ...crudApi<
    SchoolClass,
    ClassPayload,
    Partial<Omit<ClassPayload, "schoolId">>
  >("/classes"),
  students: (id: string) =>
    apiRequest<Student[]>({ method: "GET", url: `/classes/${id}/students` }),
};
