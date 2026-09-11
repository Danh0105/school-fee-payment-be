"use client";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { dashboardApi, type DashboardFilter } from "./api";
export function useDashboard(filter: DashboardFilter, enabled = true) {
  return {
    summary: useQuery({
      queryKey: [...queryKeys.dashboard, "summary", filter],
      queryFn: () => dashboardApi.summary(filter),
      enabled,
    }),
    daily: useQuery({
      queryKey: [...queryKeys.dashboard, "daily", filter],
      queryFn: () => dashboardApi.revenueByDay({ ...filter, days: 30 }),
      enabled,
    }),
    monthly: useQuery({
      queryKey: [...queryKeys.dashboard, "monthly", filter],
      queryFn: () => dashboardApi.revenueByMonth({ ...filter, months: 12 }),
      enabled,
    }),
    classes: useQuery({
      queryKey: [...queryKeys.dashboard, "classes", filter],
      queryFn: () => dashboardApi.byClass(filter),
      enabled,
    }),
    categories: useQuery({
      queryKey: [...queryKeys.dashboard, "categories", filter],
      queryFn: () => dashboardApi.byFeeCategory(filter),
      enabled,
    }),
  };
}
