"use client";

import { useQuery } from "@tanstack/react-query";
import type { PaginationParams } from "@/lib/types";
import { queryKeys } from "@/lib/query-keys";
import { receivablesApi } from "./api";

export const useReceivables = (params: PaginationParams = {}, enabled = true) =>
  useQuery({
    queryKey: [...queryKeys.receivables, params],
    queryFn: () => receivablesApi.list(params),
    placeholderData: (previous) => previous,
    enabled,
  });
export const useReceivable = (id: string) =>
  useQuery({
    queryKey: [...queryKeys.receivables, id],
    queryFn: () => receivablesApi.detail(id),
    enabled: Boolean(id),
  });
export const useStudentReceivables = (studentId: string) =>
  useQuery({
    queryKey: [...queryKeys.receivables, "student", studentId],
    queryFn: () => receivablesApi.byStudent(studentId),
    enabled: Boolean(studentId),
  });
export const useReceivableDiscounts = (id: string) =>
  useQuery({
    queryKey: [...queryKeys.receivables, id, "discounts"],
    queryFn: () => receivablesApi.discounts(id),
    enabled: Boolean(id),
  });
export const useReceivableAdjustments = (id: string) =>
  useQuery({
    queryKey: [...queryKeys.receivables, id, "adjustments"],
    queryFn: () => receivablesApi.adjustments(id),
    enabled: Boolean(id),
  });
export const useStudentLedger = (studentId: string) =>
  useQuery({
    queryKey: [...queryKeys.students, studentId, "ledger"],
    queryFn: () => receivablesApi.ledger(studentId),
    enabled: Boolean(studentId),
  });
export const useStudentCredits = (studentId: string) =>
  useQuery({
    queryKey: [...queryKeys.students, studentId, "credits"],
    queryFn: () => receivablesApi.credits(studentId),
    enabled: Boolean(studentId),
  });
