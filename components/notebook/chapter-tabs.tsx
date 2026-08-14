"use client";

import { Children, useState } from "react";
import { cn } from "@/lib/utils";

export function ChapterTabs({
  labels,
  children,
}: {
  labels: string[];
  children: React.ReactNode;
}) {
  const panels = Children.toArray(children);
  const [i, setI] = useState(0);
  return (
    <div>
      <div className="mb-4 flex gap-1 rounded-xl bg-paper-2 p-1">
        {labels.map((label, idx) => (
          <button
            key={label}
            type="button"
            onClick={() => setI(idx)}
            className={cn(
              "flex-1 rounded-lg py-2 text-sm transition-colors",
              idx === i ? "bg-kaffir text-paper" : "text-ink-muted hover:bg-paper-3",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {panels[i]}
    </div>
  );
}
