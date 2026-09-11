"use client";
import { queryKeys } from "@/lib/query-keys";
import type { PaginationParams } from "@/lib/types";
import { useEntityDetail, useEntityList } from "@/features/shared/hooks";
import { feePlansApi } from "./api";
export const useFeePlans = (params: PaginationParams = {}, enabled = true) =>
  useEntityList(queryKeys.feePlans, params, feePlansApi.list, enabled);
export const useFeePlan = (id: string) =>
  useEntityDetail(queryKeys.feePlans, id, feePlansApi.detail);
