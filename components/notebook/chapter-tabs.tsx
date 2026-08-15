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
      <div className="mb-5 flex gap-1 overflow-x-auto rounded-[var(--radius-md)] bg-paper-2 p-1">
        {labels.map((label, idx) => (
          <button
            key={label}
            type="button"
            onClick={() => setI(idx)}
            className={cn("df-chip df-press flex-1 justify-center", idx === i && "df-chip-active")}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="df-enter" key={i}>
        {panels[i]}
      </div>
    </div>
  );
}
