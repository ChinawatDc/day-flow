import { cn } from "@/lib/utils";

export function navTabClass(active: boolean) {
  return cn(
    "df-press flex flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-2 text-[11px]",
    active ? "bg-paper-2 text-ink" : "text-ink-muted hover:bg-paper-2",
  );
}

export function navRailClass(active: boolean) {
  return cn(
    "df-press flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm",
    active ? "bg-kaffir text-surface" : "text-ink hover:bg-paper-2",
  );
}
