"use client";
import { queryKeys } from "@/lib/query-keys";
import type { PaginationParams } from "@/lib/types";
import { useEntityDetail, useEntityList } from "@/features/shared/hooks";
import { feeCategoriesApi } from "./api";
export const useFeeCategories = (
  params: PaginationParams = {},
  enabled = true,
) =>
  useEntityList(
    queryKeys.feeCategories,
    params,
    feeCategoriesApi.list,
    enabled,
  );
export const useFeeCategory = (id: string) =>
  useEntityDetail(queryKeys.feeCategories, id, feeCategoriesApi.detail);
