"use client";
import { useQuery } from "@tanstack/react-query";
import type { EInvoiceStatus, PaginationParams } from "@/lib/types";
import { queryKeys } from "@/lib/query-keys";
import { einvoicesApi, type EInvoiceDownload } from "./api";

/** Statuses the background workers will still move on their own. */
const IN_PROGRESS: EInvoiceStatus[] = [
  "PENDING",
  "QUEUED",
  "PROCESSING",
  "WAITING_INVOICE_NUMBER",
  "ISSUED",
  "FILE_PENDING",
];

export const isInProgress = (status?: EInvoiceStatus) =>
  Boolean(status && IN_PROGRESS.includes(status));

const POLL_MS = 5_000;

export const useEInvoices = (params: PaginationParams = {}) =>
  useQuery({
    queryKey: [...queryKeys.einvoices, "list", params],
    queryFn: () => einvoicesApi.list(params),
    placeholderData: (previous) => previous,
  });

export const useEInvoice = (id: string, enabled = true) =>
  useQuery({
    queryKey: [...queryKeys.einvoices, "detail", id],
    queryFn: () => einvoicesApi.detail(id),
    enabled: Boolean(id) && enabled,
    refetchInterval: (query) =>
      isInProgress(query.state.data?.status) ? POLL_MS : false,
  });

export const useReceiptEInvoice = (receiptId: string) =>
  useQuery({
    queryKey: [...queryKeys.einvoices, "receipt", receiptId],
    queryFn: async () =>
      (await einvoicesApi.list({ receiptId, limit: 1 })).data[0] ?? null,
    enabled: Boolean(receiptId),
    refetchInterval: (query) =>
      isInProgress(query.state.data?.status) ? POLL_MS : false,
  });

export const useEInvoiceProviderStatus = () =>
  useQuery({
    queryKey: [...queryKeys.einvoices, "provider-status"],
    queryFn: einvoicesApi.providerStatus,
    staleTime: 5 * 60_000,
  });

export const useEInvoiceConfig = (schoolId: string) =>
  useQuery({
    queryKey: [...queryKeys.einvoices, "config", schoolId],
    queryFn: () => einvoicesApi.config(schoolId),
    enabled: Boolean(schoolId),
  });

/**
 * The stored file of an issued invoice. `version` changes once the invoice
 * has the file, so a "not ready yet" answer is not cached forever.
 */
export const useEInvoiceFile = (
  id: string,
  type: EInvoiceDownload,
  version: string,
  enabled: boolean,
) =>
  useQuery({
    queryKey: [...queryKeys.einvoices, "file", id, type, version],
    queryFn: () => einvoicesApi.file(id, type),
    enabled: Boolean(id) && enabled,
    retry: false,
    staleTime: Infinity,
    gcTime: 60_000,
  });
