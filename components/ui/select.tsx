import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function NativeSelect({
  className,
  children,
  ...props
}: ComponentProps<"select">) {
  return (
    <select className={cn("df-field", className)} {...props}>
      {children}
    </select>
  );
}
