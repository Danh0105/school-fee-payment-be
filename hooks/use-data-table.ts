"use client";

import { useMemo, useState } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { SortOrder } from "@/lib/types";

export function useDataTable(initialSortBy = "createdAt", initialLimit = 20) {
  const [page, setPage] = useState(1);
  const [limit, setLimitState] = useState(initialLimit);
  const [search, setSearchState] = useState("");
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState<SortOrder>("DESC");
  const debouncedSearch = useDebouncedValue(search);

  const setSearch = (value: string) => {
    setSearchState(value);
    setPage(1);
  };
  const setLimit = (value: number) => {
    setLimitState(value);
    setPage(1);
  };
  const toggleSort = (field: string) => {
    if (sortBy === field)
      setSortOrder((current) => (current === "ASC" ? "DESC" : "ASC"));
    else {
      setSortBy(field);
      setSortOrder("ASC");
    }
    setPage(1);
  };

  const query = useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
      sortBy,
      sortOrder,
    }),
    [page, limit, debouncedSearch, sortBy, sortOrder],
  );

  return {
    page,
    limit,
    search,
    sortBy,
    sortOrder,
    query,
    setPage,
    setLimit,
    setSearch,
    toggleSort,
  };
}
