"use client";

import { createContext, useContext, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const ComposerCloseContext = createContext<(() => void) | null>(null);

export function useComposerClose() {
  return useContext(ComposerCloseContext);
}

export function ComposerSheet({
  label,
  title,
  children,
  variant = "default",
  compact = false,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
  variant?: "default" | "orange" | "outline";
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant={variant}
          size={compact ? "sm" : "default"}
          className={compact ? undefined : "w-full"}
        >
          {label}
        </Button>
      </SheetTrigger>
      <SheetContent title={title} className="max-h-[88vh] overflow-y-auto pb-10">
        <div className="mx-auto mb-3 mt-1 h-1 w-10 rounded-full bg-line" aria-hidden />
        <div className="mt-2 grid gap-3">
          <ComposerCloseContext.Provider value={() => setOpen(false)}>{children}</ComposerCloseContext.Provider>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/** Wrap a server-action form so the sheet closes after a successful submit. */
export function ClosingForm({
  action,
  children,
  className,
}: {
  action?: (formData: FormData) => void | Promise<void>;
  children: React.ReactNode;
  className?: string;
}) {
  const close = useComposerClose();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  return (
    <form
      className={cn(className)}
      onSubmit={(e) => {
        e.preventDefault();
        setError("");
        const fd = new FormData(e.currentTarget);
        start(async () => {
          try {
            if (action) await action(fd);
            close?.();
          } catch (err) {
            const dig = err as { digest?: string };
            if (typeof dig?.digest === "string" && dig.digest.startsWith("NEXT_")) throw err;
            setError(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
          }
        });
      }}
    >
      {children}
      {error ? <p className="text-sm text-orange">{error}</p> : null}
      {pending ? <p className="text-caption">กำลังบันทึก…</p> : null}
    </form>
  );
}
