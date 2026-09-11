import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#237fb5]/35 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-y-px [&_svg]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[#078247] text-white shadow-[0_8px_20px_-10px_rgba(7,130,71,0.9)] hover:bg-[#056c3b] hover:shadow-[0_10px_24px_-10px_rgba(7,130,71,0.8)]",
        destructive: "bg-rose-600 text-white shadow-sm hover:bg-rose-700",
        outline:
          "border border-[#078247]/20 bg-white text-[#075f3b] shadow-sm hover:border-[#078247]/45 hover:bg-[#eef8ee]",
        secondary: "bg-[#e9f3f9] text-[#155e92] hover:bg-[#dcecf6]",
        ghost: "text-slate-600 hover:bg-[#edf7ed] hover:text-[#075f3b]",
        link: "text-[#237fb5] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-[14px] px-6",
        icon: "size-10 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
