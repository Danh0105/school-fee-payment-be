"use client";
import { queryKeys } from "@/lib/query-keys";
import type { PaginationParams } from "@/lib/types";
import { useEntityDetail, useEntityList } from "@/features/shared/hooks";
import { schoolsApi } from "./api";
export const useSchools = (params: PaginationParams = {}) =>
  useEntityList(queryKeys.schools, params, schoolsApi.list);
export const useSchool = (id: string) =>
  useEntityDetail(queryKeys.schools, id, schoolsApi.detail);
