"use client";
import { queryKeys } from "@/lib/query-keys";
import type { PaginationParams } from "@/lib/types";
import {
  useEntityDetail,
  useEntityList,
  useEntityMutation,
} from "@/features/shared/hooks";
import { studentsApi, type AssignStudentPayload } from "./api";
export const useStudents = (params: PaginationParams = {}, enabled = true) =>
  useEntityList(queryKeys.students, params, studentsApi.list, enabled);
export const useStudent = (id: string) =>
  useEntityDetail(queryKeys.students, id, studentsApi.detail);
export const useAssignStudent = () =>
  useEntityMutation<AssignStudentPayload, unknown>({
    mutationFn: studentsApi.assignClass,
    queryKey: queryKeys.students,
    successMessage: "Đã xếp học sinh vào lớp",
  });
