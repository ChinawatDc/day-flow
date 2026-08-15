import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "df-press inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] text-sm font-medium disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
  {
    variants: {
      variant: {
        default: "bg-kaffir text-surface hover:bg-kaffir-dark",
        orange: "bg-orange text-surface hover:bg-orange/90",
        outline: "border border-line bg-surface hover:bg-paper-2",
        ghost: "hover:bg-paper-2",
        ink: "bg-ink text-surface hover:bg-ink/90",
        soft: "bg-surface text-kaffir shadow-[var(--shadow-sm)] hover:bg-paper-2",
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
