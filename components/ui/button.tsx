import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-[color,background-color,transform,filter] duration-150 disabled:pointer-events-none disabled:opacity-50 hover:brightness-[0.97] active:scale-95 active:brightness-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kaffir",
  {
    variants: {
      variant: {
        default: "bg-kaffir text-paper hover:bg-kaffir-dark",
        orange: "bg-orange text-paper hover:bg-orange/90",
        outline: "border border-line bg-surface hover:bg-paper-2",
        ghost: "hover:bg-paper-3",
        ink: "bg-ink text-paper hover:bg-ink/90",
        soft: "bg-surface text-kaffir shadow-sm hover:bg-paper",
      },
      size: {
        default: "h-11 px-4",
        sm: "h-8 px-3 text-xs",
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
