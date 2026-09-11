import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const variants = cva(
  "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-extrabold tracking-wide",
  {
    variants: {
      variant: {
        default:
          "bg-[#edf7ed] text-[#087444] ring-1 ring-inset ring-[#078247]/18",
        success:
          "bg-[#edf7ed] text-[#087444] ring-1 ring-inset ring-[#078247]/18",
        warning:
          "bg-[#fff6df] text-[#9c6c08] ring-1 ring-inset ring-[#dfa72f]/25",
        destructive:
          "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/15",
        secondary:
          "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-600/10",
        info: "bg-[#e9f3f9] text-[#176b9e] ring-1 ring-inset ring-[#237fb5]/18",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof variants>) {
  return <span className={cn(variants({ variant }), className)} {...props} />;
}
