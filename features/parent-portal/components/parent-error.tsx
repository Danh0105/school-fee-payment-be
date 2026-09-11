"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/error-messages";

export function ParentError({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center">
      <AlertCircle className="mx-auto size-8 text-rose-600" />
      <p className="mt-3 font-bold text-rose-900">Không thể tải thông tin</p>
      <p className="mt-1 text-sm leading-6 text-rose-700">
        {getErrorMessage(error)}
      </p>
      {onRetry && (
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          Thử lại
        </Button>
      )}
    </div>
  );
}
