"use client";

import { ClosingForm } from "@/components/notebook/composer-sheet";
import { cn } from "@/lib/utils";

export function NotebookForm({
  action,
  children,
  className,
}: {
  action?: (formData: FormData) => void | Promise<void>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <ClosingForm action={action} className={cn("grid gap-3", className)}>
      {children}
    </ClosingForm>
  );
}
