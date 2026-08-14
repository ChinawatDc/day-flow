"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant={variant} size={compact ? "sm" : "default"} className={compact ? undefined : "w-full"}>
          {label}
        </Button>
      </SheetTrigger>
      <SheetContent title={title} className="max-h-[85vh] overflow-y-auto pb-10">
        <div className="mt-4 grid gap-3">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
