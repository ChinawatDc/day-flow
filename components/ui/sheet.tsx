"use client";

import type { ComponentProps } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export function SheetContent({
  className,
  children,
  side = "bottom",
  title = "เมนู",
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & {
  side?: "bottom" | "left";
  title?: string;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-[4px]" />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-50 border border-[var(--glass-line)] p-5 shadow-[var(--shadow-lg)] outline-none",
          "bg-[linear-gradient(180deg,color-mix(in_oklch,var(--surface-solid)_70%,transparent)_0%,color-mix(in_oklch,var(--surface-solid)_88%,transparent)_100%)]",
          "backdrop-blur-[var(--blur-sheet)] saturate-[118%]",
          side === "bottom" && "inset-x-0 bottom-0 rounded-t-[var(--radius-xl)] border-t",
          side === "left" && "inset-y-0 left-0 w-72 border-r",
          className,
        )}
        {...props}
      >
        <DialogPrimitive.Title className="text-title">{title}</DialogPrimitive.Title>
        <SheetClose className="absolute right-4 top-4 text-ink-muted">
          <X className="size-5" />
        </SheetClose>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
