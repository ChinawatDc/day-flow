import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn("df-field min-h-28 py-2.5", className)}
      {...props}
    />
  );
}
