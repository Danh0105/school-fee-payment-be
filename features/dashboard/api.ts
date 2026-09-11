import { apiRequest } from "@/lib/api-client";
import { compactParams } from "@/lib/utils";
import type {
  DashboardBreakdown,
  DashboardSummary,
  RevenueDay,
  RevenueMonth,
} from "@/lib/types";
export interface DashboardFilter {
  schoolId?: string;
  academicYearId?: string;
}
export const dashboardApi = {
  summary: (filter: DashboardFilter) =>
    apiRequest<DashboardSummary>({
      method: "GET",
      url: "/dashboard/summary",
      params: compactParams(filter),
    }),
  revenueByDay: (filter: DashboardFilter & { days?: number }) =>
    apiRequest<RevenueDay[]>({
      method: "GET",
      url: "/dashboard/revenue-by-day",
      params: compactParams(filter),
    }),
  revenueByMonth: (filter: DashboardFilter & { months?: number }) =>
    apiRequest<RevenueMonth[]>({
      method: "GET",
      url: "/dashboard/revenue-by-month",
      params: compactParams(filter),
    }),
  byClass: (filter: DashboardFilter) =>
    apiRequest<DashboardBreakdown[]>({
      method: "GET",
      url: "/dashboard/by-class",
      params: compactParams(filter),
    }),
  byFeeCategory: (filter: DashboardFilter) =>
    apiRequest<DashboardBreakdown[]>({
      method: "GET",
      url: "/dashboard/by-fee-category",
      params: compactParams(filter),
    }),
};
