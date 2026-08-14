import { cn } from "@/lib/utils";

export function navTabClass(active: boolean) {
  return cn(
    "flex flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-1.5 text-[11px] transition-colors duration-150 active:scale-95",
    active ? "bg-kaffir text-paper" : "text-ink-muted hover:bg-paper-3",
  );
}

export function navRailClass(active: boolean) {
  return cn(
    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-150 active:scale-[0.99]",
    active ? "bg-kaffir text-paper" : "text-ink hover:bg-paper-3",
  );
}
