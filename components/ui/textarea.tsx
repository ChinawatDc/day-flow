import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-md border border-line bg-paper px-3 py-2 text-base text-ink outline-none placeholder:text-ink-muted focus:border-kaffir focus:ring-2 focus:ring-kaffir/30",
        className,
      )}
      {...props}
    />
  );
}
