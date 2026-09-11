import { apiRequest } from "@/lib/api-client";
import type { AcademicYear } from "@/lib/types";

export const academicYearsApi = {
  current: (schoolId: string) =>
    apiRequest<AcademicYear>({
      method: "GET",
      url: "/academic-years/current",
      params: { schoolId },
    }),
};
