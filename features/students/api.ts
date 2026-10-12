import { apiRequest } from "@/lib/api-client";
import { crudApi } from "@/features/shared/crud";
import type { Student } from "@/lib/types";
export interface StudentPayload {
  schoolId: string;
  identifierCode?: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  address?: string;
  phone?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  parentPassword?: string;
  status?: "ACTIVE" | "INACTIVE" | "GRADUATED" | "TRANSFERRED";
}
export interface AssignStudentPayload {
  studentId: string;
  classId: string;
  academicYearId: string;
}
export const studentsApi = {
  ...crudApi<Student, StudentPayload>("/students"),
  assignClass: (payload: AssignStudentPayload) =>
    apiRequest({
      method: "POST",
      url: "/student-classes/assign",
      data: payload,
    }),
};
