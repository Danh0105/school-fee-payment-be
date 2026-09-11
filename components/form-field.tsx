import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </Label>
      {children}
      {hint && !error && (
        <p className="text-xs leading-5 text-slate-500">{hint}</p>
      )}
      {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}
