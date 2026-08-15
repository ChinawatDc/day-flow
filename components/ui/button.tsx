import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "df-press inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] text-sm font-medium disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--canvas)]",
  {
    variants: {
      variant: {
        default: "bg-kaffir text-surface hover:bg-kaffir-dark",
        orange: "bg-orange text-surface hover:bg-orange/90",
        outline:
          "border border-[var(--glass-line)] bg-[color-mix(in_oklch,var(--surface-solid)_70%,transparent)] text-ink backdrop-blur-[10px] hover:bg-[color-mix(in_oklch,var(--surface-solid)_88%,transparent)]",
        ghost: "text-ink hover:bg-[color-mix(in_oklch,var(--surface-solid)_55%,transparent)]",
        ink: "bg-ink text-surface hover:bg-ink/90",
        soft:
          "border border-[var(--glass-line)] bg-[color-mix(in_oklch,var(--surface-solid)_78%,transparent)] text-kaffir shadow-[var(--shadow-sm)] backdrop-blur-[12px] hover:bg-[color-mix(in_oklch,var(--surface-solid)_92%,transparent)]",
      },
      size: {
        default: "h-11 px-4",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-5 text-base",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />
  );
}
