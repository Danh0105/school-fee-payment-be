"use client";

import type { ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Search,
  Inbox,
} from "lucide-react";
import type { PaginationMeta, SortOrder } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface DataColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: DataColumn<T>[];
  data?: T[];
  meta?: PaginationMeta;
  loading?: boolean;
  search: string;
  onSearch: (value: string) => void;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: SortOrder;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onSort: (key: string) => void;
  filters?: ReactNode;
  actions?: ReactNode;
  searchPlaceholder?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  getRowKey: (row: T) => string;
}

export function DataTable<T>({
  columns,
  data = [],
  meta,
  loading,
  search,
  onSearch,
  page,
  limit,
  sortBy,
  sortOrder,
  onPageChange,
  onLimitChange,
  onSort,
  filters,
  actions,
  searchPlaceholder = "Tìm kiếm…",
  emptyTitle = "Chưa có dữ liệu",
  emptyDescription = "Dữ liệu phù hợp sẽ xuất hiện tại đây.",
  getRowKey,
}: DataTableProps<T>) {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-[#078247]/12 bg-white shadow-[0_20px_55px_-38px_rgba(5,76,59,0.55)] before:absolute before:inset-x-6 before:top-0 before:h-[3px] before:bg-gradient-to-r before:from-[#078247] before:via-[#dfa72f] before:to-[#237fb5]">
      <div className="flex flex-col gap-3 border-b border-[#078247]/8 bg-[#fcfdf9] p-4 pt-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#237fb5]" />
            <Input
              className="pl-9"
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder={searchPlaceholder}
            />
          </div>
          {filters}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>

      {loading ? (
        <div className="space-y-3 p-4">
          <Skeleton className="h-10 w-full" />
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-[#edf7ed] text-[#078247]">
            <Inbox className="size-6" />
          </div>
          <h3 className="font-display font-bold text-slate-900">
            {emptyTitle}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            {emptyDescription}
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.sortable ? (
                    <button
                      className="inline-flex items-center gap-1.5 hover:text-slate-900"
                      onClick={() => onSort(column.key)}
                    >
                      {column.header}
                      {sortBy === column.key ? (
                        sortOrder === "ASC" ? (
                          <ArrowUp className="size-3.5" />
                        ) : (
                          <ArrowDown className="size-3.5" />
                        )
                      ) : (
                        <ChevronsUpDown className="size-3.5 opacity-50" />
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={getRowKey(row)}>
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
                    {column.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div className="flex flex-col gap-3 border-t border-[#078247]/8 bg-[#fcfdf9] px-4 py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {meta
            ? `${meta.total.toLocaleString("vi-VN")} kết quả · Trang ${meta.page}/${Math.max(meta.totalPages, 1)}`
            : ""}
        </div>
        <div className="flex items-center gap-2">
          <select
            className="h-8 rounded-lg border border-[#078247]/15 bg-white px-2 text-xs outline-none focus:border-[#237fb5]"
            value={limit}
            onChange={(event) => onLimitChange(Number(event.target.value))}
            aria-label="Số dòng mỗi trang"
          >
            {[10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size} dòng
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => onPageChange(page - 1)}
          >
            Trước
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={loading || page >= (meta?.totalPages ?? 1)}
            onClick={() => onPageChange(page + 1)}
          >
            Sau
          </Button>
        </div>
      </div>
    </div>
  );
}
