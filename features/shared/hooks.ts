"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error-messages";
import type { PaginatedResult, PaginationParams } from "@/lib/types";

export function useEntityList<T>(
  queryKey: readonly unknown[],
  params: PaginationParams,
  fetcher: (params: PaginationParams) => Promise<PaginatedResult<T>>,
  enabled = true,
) {
  return useQuery({
    queryKey: [...queryKey, params],
    queryFn: () => fetcher(params),
    placeholderData: (previous) => previous,
    enabled,
  });
}

export function useEntityDetail<T>(
  queryKey: readonly unknown[],
  id: string,
  fetcher: (id: string) => Promise<T>,
) {
  return useQuery({
    queryKey: [...queryKey, id],
    queryFn: () => fetcher(id),
    enabled: Boolean(id),
  });
}

export function useEntityMutation<TVariables, TResult>({
  mutationFn,
  queryKey,
  successMessage,
}: {
  mutationFn: (variables: TVariables) => Promise<TResult>;
  queryKey: readonly unknown[];
  successMessage: string;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      toast.success(successMessage);
      void queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
