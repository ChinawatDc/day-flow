import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-md border border-line bg-paper px-3 text-base text-ink outline-none placeholder:text-ink-muted focus:border-kaffir focus:ring-2 focus:ring-kaffir/30",
        className,
      )}
      {...props}
    />
  );
}
