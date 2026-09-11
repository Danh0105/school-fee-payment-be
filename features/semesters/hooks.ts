"use client";
import { queryKeys } from "@/lib/query-keys";
import type { PaginationParams } from "@/lib/types";
import { useEntityList } from "@/features/shared/hooks";
import { isUuid } from "@/lib/validation";
import { semestersApi } from "./api";
export const useSemesters = (params: PaginationParams = {}) =>
  useEntityList(
    queryKeys.semesters,
    params,
    semestersApi.list,
    isUuid(String(params.academicYearId ?? "")),
  );
