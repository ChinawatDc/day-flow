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
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/40" />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-4 right-4 top-1/2 z-50 max-h-[90vh] overflow-y-auto rounded-xl border border-line bg-paper p-5 shadow-xl md:left-[max(16rem,calc(50%-20rem))] md:right-auto md:w-[40rem] md:-translate-y-1/2",
          className,
        )}
        {...props}
      >
        <DialogPrimitive.Title className="font-display text-xl">{title}</DialogPrimitive.Title>
        <div className="mt-4">{children}</div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
