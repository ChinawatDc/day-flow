"use client";

import { Children, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export type ChapterTabItem = {
  key: string;
  label: string;
  set?: Record<string, string>;
  unset?: string[];
};

export function ChapterTabs({
  labels,
  keys,
  param,
  value,
  items,
  children,
}: {
  labels?: string[];
  keys?: string[];
  param?: string;
  value?: string;
  items?: ChapterTabItem[];
  children: React.ReactNode;
}) {
  const tabs: ChapterTabItem[] =
    items ??
    (labels ?? []).map((label, idx) => ({
      key: keys?.[idx] ?? String(idx),
      label,
    }));
  const panels = Children.toArray(children);
  const fromValue = Math.max(
    0,
    tabs.findIndex((t) => t.key === value),
  );
  const [i, setI] = useState(value ? fromValue : 0);
  const router = useRouter();
  const pathname = usePathname();

  const tabKeys = tabs.map((t) => t.key).join("|");
  useEffect(() => {
    if (value == null) return;
    const list = tabKeys.split("|");
    const next = list.indexOf(value);
    setI(next < 0 ? 0 : next);
  }, [value, tabKeys]);

  function pick(idx: number) {
    setI(idx);
    if (!param) return;
    const tab = tabs[idx];
    const sp = new URLSearchParams(typeof window === "undefined" ? "" : window.location.search);
    sp.set(param, tab.key);
    for (const [k, v] of Object.entries(tab.set ?? {})) sp.set(k, v);
    for (const k of tab.unset ?? []) sp.delete(k);
    const q = sp.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }

  return (
    <div>
      <div className="df-track mb-5 flex gap-1 overflow-x-auto">
        {tabs.map((tab, idx) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => pick(idx)}
            className={cn("df-chip df-press flex-1 justify-center", idx === i && "df-chip-active")}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="df-enter" key={i}>
        {panels[i]}
      </div>
    </div>
  );
}
