import Link from "next/link";
import { cn } from "@/lib/utils";

export function FilterPills({
  items,
}: {
  items: { href: string; label: string; active: boolean }[];
}) {
  return (
    <div className="df-track mb-5 flex gap-1 overflow-x-auto">
      {items.map((it) => (
        <Link
          key={it.href}
          href={it.href}
          className={cn("df-chip shrink-0", it.active && "df-chip-active")}
        >
          {it.label}
        </Link>
      ))}
    </div>
  );
}
