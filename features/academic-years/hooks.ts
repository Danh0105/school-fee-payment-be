"use client";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { isUuid } from "@/lib/validation";
import { academicYearsApi } from "./api";

export const useCurrentAcademicYear = (schoolId?: string) =>
  useQuery({
    queryKey: queryKeys.currentAcademicYear(schoolId ?? ""),
    queryFn: () => academicYearsApi.current(schoolId ?? ""),
    enabled: isUuid(schoolId),
  });
