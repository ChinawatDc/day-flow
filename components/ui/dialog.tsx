"use client";

import type { ComponentProps } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  className,
  children,
  title,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & { title: string }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/35 backdrop-blur-[2px]" />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-4 right-4 top-1/2 z-50 max-h-[90vh] -translate-y-1/2 overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--stroke)] bg-surface p-5 shadow-[var(--shadow-lg)] md:left-[max(16rem,calc(50%-20rem))] md:right-auto md:w-[40rem]",
          className,
        )}
        {...props}
      >
        <DialogPrimitive.Title className="text-title">{title}</DialogPrimitive.Title>
        <div className="mt-4">{children}</div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
