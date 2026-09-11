import { apiRequest } from "@/lib/api-client";
import { compactParams } from "@/lib/utils";
import type { PaginatedResult, PaginationParams, Semester } from "@/lib/types";

export const semestersApi = {
  list: (params: PaginationParams = {}) =>
    apiRequest<PaginatedResult<Semester>>({
      method: "GET",
      url: "/semesters",
      params: compactParams(params),
    }),
};
