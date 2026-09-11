"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
export function JsonChangeCell({
  oldData,
  newData,
}: {
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
}) {
  const [open, setOpen] = useState(false);
  if (!oldData && !newData) return <span className="text-slate-300">—</span>;
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-1 text-xs font-semibold text-teal-700 hover:underline">
        {open ? "Thu gọn" : "Xem thay đổi"}
        <ChevronDown
          className={`size-3.5 transition ${open ? "rotate-180" : ""}`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 grid max-w-xl gap-2 sm:grid-cols-2">
          {oldData && (
            <pre className="max-h-52 overflow-auto rounded-lg bg-rose-50 p-2 text-[10px] text-rose-900">
              {JSON.stringify(oldData, null, 2)}
            </pre>
          )}
          {newData && (
            <pre className="max-h-52 overflow-auto rounded-lg bg-emerald-50 p-2 text-[10px] text-emerald-900">
              {JSON.stringify(newData, null, 2)}
            </pre>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
