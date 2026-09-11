import Decimal from "decimal.js";
import { apiRequest } from "@/lib/api-client";
import { ApiError } from "@/lib/error-messages";
import { compactParams } from "@/lib/utils";
import type {
  ClassReport,
  PaginatedResult,
  PaginationParams,
  Receivable,
  ReceivablesReport,
  ReceivablesReportSummary,
} from "@/lib/types";
export interface ReportParams extends PaginationParams {
  schoolId?: string;
  academicYearId?: string;
  semesterId?: string;
  classId?: string;
  studentId?: string;
  feeCategoryId?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
}
let supportsReportQuery: boolean | undefined;

async function receivablesFallback(
  params: ReportParams,
): Promise<ReceivablesReport> {
  const { fromDate, toDate, page = 1, limit = 20, ...listParams } = params;
  const fetchPage = (currentPage: number) =>
    apiRequest<PaginatedResult<Receivable>>({
      method: "GET",
      url: "/receivables",
      params: compactParams({ ...listParams, page: currentPage, limit: 200 }),
    });
  const first = await fetchPage(1);
  const remaining = await Promise.all(
    Array.from({ length: Math.max(0, first.meta.totalPages - 1) }, (_, index) =>
      fetchPage(index + 2),
    ),
  );
  const allRows = [first, ...remaining]
    .flatMap((result) => result.data)
    .filter((row) => {
      const date = row.createdAt.slice(0, 10);
      return (!fromDate || date >= fromDate) && (!toDate || date <= toDate);
    });
  const summary = summarizeReceivables(allRows);
  const start = (page - 1) * limit;
  return {
    summary,
    data: allRows.slice(start, start + limit),
    meta: {
      page,
      limit,
      total: allRows.length,
      totalPages: Math.ceil(allRows.length / limit),
    },
  };
}

function summarizeReceivables(rows: Receivable[]): ReceivablesReportSummary {
  const totals = rows.reduce(
    (result, row) => {
      const adjustment = new Decimal(row.adjustmentAmount);
      result.totalReceivable = result.totalReceivable.plus(row.originalAmount);
      result.totalDiscount = result.totalDiscount.plus(row.discountAmount);
      result.totalDue = result.totalDue.plus(row.amountDue);
      result.totalPaid = result.totalPaid.plus(row.amountPaid);
      result.totalOutstanding = result.totalOutstanding.plus(
        row.amountOutstanding,
      );
      if (adjustment.isPositive())
        result.totalAdjustmentIncrease =
          result.totalAdjustmentIncrease.plus(adjustment);
      if (adjustment.isNegative())
        result.totalAdjustmentDecrease = result.totalAdjustmentDecrease.plus(
          adjustment.abs(),
        );
      if (row.status === "PAID") result.studentsPaid += 1;
      if (row.status === "UNPAID" || row.status === "OVERDUE")
        result.studentsUnpaid += 1;
      if (row.status === "PARTIALLY_PAID") result.studentsPartial += 1;
      return result;
    },
    {
      totalReceivable: new Decimal(0),
      totalDiscount: new Decimal(0),
      totalAdjustmentIncrease: new Decimal(0),
      totalAdjustmentDecrease: new Decimal(0),
      totalDue: new Decimal(0),
      totalPaid: new Decimal(0),
      totalOutstanding: new Decimal(0),
      studentsPaid: 0,
      studentsUnpaid: 0,
      studentsPartial: 0,
    },
  );
  return {
    totalReceivable: totals.totalReceivable.toFixed(2),
    totalDiscount: totals.totalDiscount.toFixed(2),
    totalAdjustmentIncrease: totals.totalAdjustmentIncrease.toFixed(2),
    totalAdjustmentDecrease: totals.totalAdjustmentDecrease.toFixed(2),
    totalDue: totals.totalDue.toFixed(2),
    totalPaid: totals.totalPaid.toFixed(2),
    totalOutstanding: totals.totalOutstanding.toFixed(2),
    studentsPaid: totals.studentsPaid,
    studentsUnpaid: totals.studentsUnpaid,
    studentsPartial: totals.studentsPartial,
    collectionRate: totals.totalDue.greaterThan(0)
      ? totals.totalPaid
          .dividedBy(totals.totalDue)
          .times(100)
          .toDecimalPlaces(2)
          .toNumber()
      : 0,
  };
}

async function receivablesReport(params: ReportParams = {}) {
  if (supportsReportQuery !== false) {
    try {
      const report = await apiRequest<ReceivablesReport>({
        method: "GET",
        url: "/reports/receivables",
        params: compactParams(params),
      });
      supportsReportQuery = true;
      return report;
    } catch (error) {
      const incompatibleQuery =
        error instanceof ApiError &&
        error.code === "VALIDATION_ERROR" &&
        Array.isArray(error.details) &&
        error.details.some((detail) =>
          String(detail).includes("should not exist"),
        );
      if (!incompatibleQuery) throw error;
      supportsReportQuery = false;
    }
  }
  return receivablesFallback(params);
}

export const reportsApi = {
  receivables: receivablesReport,
  class: (id: string) =>
    apiRequest<ClassReport>({ method: "GET", url: `/reports/classes/${id}` }),
};
