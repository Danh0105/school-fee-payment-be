import { apiRequest } from "@/lib/api-client";
import { compactParams } from "@/lib/utils";
import type { PaginatedResult, PaginationParams } from "@/lib/types";

export function crudApi<
  T,
  CreatePayload,
  UpdatePayload = Partial<CreatePayload>,
>(path: string) {
  return {
    list: (params: PaginationParams = {}) =>
      apiRequest<PaginatedResult<T>>({
        method: "GET",
        url: path,
        params: compactParams(params),
      }),
    detail: (id: string) =>
      apiRequest<T>({ method: "GET", url: `${path}/${id}` }),
    create: (payload: CreatePayload) =>
      apiRequest<T>({ method: "POST", url: path, data: payload }),
    update: (id: string, payload: UpdatePayload) =>
      apiRequest<T>({ method: "PATCH", url: `${path}/${id}`, data: payload }),
    remove: (id: string) =>
      apiRequest<void>({ method: "DELETE", url: `${path}/${id}` }),
  };
}
