import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

/** Refreshes invoice rows and statuses, leaving downloaded files cached. */
export function invalidateEInvoices(client: QueryClient): void {
  for (const scope of ["list", "detail", "receipt"])
    void client.invalidateQueries({
      queryKey: [...queryKeys.einvoices, scope],
    });
}
