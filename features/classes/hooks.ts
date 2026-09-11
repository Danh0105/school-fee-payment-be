"use client";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { PaginationParams } from "@/lib/types";
import { useEntityDetail, useEntityList } from "@/features/shared/hooks";
import { classesApi } from "./api";
export const useClasses = (params: PaginationParams = {}, enabled = true) =>
  useEntityList(queryKeys.classes, params, classesApi.list, enabled);
export const useClass = (id: string) =>
  useEntityDetail(queryKeys.classes, id, classesApi.detail);
export const useClassStudents = (id: string) =>
  useQuery({
    queryKey: [...queryKeys.classes, id, "students"],
    queryFn: () => classesApi.students(id),
    enabled: Boolean(id),
  });
