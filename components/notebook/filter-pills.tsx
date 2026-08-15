import Link from "next/link";
import { cn } from "@/lib/utils";

export function FilterPills({
  items,
}: {
  items: { href: string; label: string; active: boolean }[];
}) {
  return (
    <div className="mb-4 flex gap-1 overflow-x-auto rounded-full bg-paper-2 p-1">
      {items.map((it) => (
        <Link
          key={it.href}
          href={it.href}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150",
            it.active ? "bg-surface text-ink shadow-[var(--shadow-card)]" : "text-ink-muted hover:text-ink",
          )}
        >
          {it.label}
        </Link>
      ))}
    </div>
  );
}
