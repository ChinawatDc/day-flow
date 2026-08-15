import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { modules, settingsModule, type AppModule } from "@/lib/modules";
import { cn } from "@/lib/utils";

export function MenuCards({
  items = [...modules, settingsModule],
}: {
  items?: AppModule[];
}) {
  return (
    <ul className="df-card df-stagger divide-y divide-[var(--stroke)] overflow-hidden p-0">
      {items.map((m, i) => {
        const Icon = m.icon;
        return (
          <li key={m.id} style={{ ["--df-i" as string]: i }}>
            <Link
              href={m.href}
              className={cn(
                "df-press flex items-center gap-3.5 px-4 py-3.5",
                "hover:bg-[color-mix(in_oklch,var(--brand-soft)_45%,transparent)]",
              )}
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-md)] border border-[var(--glass-line)] bg-[color-mix(in_oklch,var(--brand-soft)_75%,transparent)] text-kaffir backdrop-blur-[8px]">
                <Icon className="size-[1.15rem]" strokeWidth={2.1} />
              </span>
              <span className="text-title min-w-0 flex-1 truncate text-[1.05rem]">{m.label}</span>
              <ChevronRight className="size-4 shrink-0 text-ink-faint" aria-hidden />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
