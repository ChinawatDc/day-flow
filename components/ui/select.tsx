import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function NativeSelect({
  className,
  children,
  ...props
}: ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-md border border-line bg-paper px-3 text-base text-ink outline-none focus:border-kaffir focus:ring-2 focus:ring-kaffir/30",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
