import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { modules, settingsModule, type AppModule } from "@/lib/modules";
import { cn } from "@/lib/utils";

export type MenuLink = {
  href: string;
  label: string;
  hint?: string;
  icon: LucideIcon;
};

export type MenuGroup = {
  title: string;
  items: MenuLink[];
};

export function MenuCards({
  items = [...modules, settingsModule],
  groups,
}: {
  items?: AppModule[];
  groups?: MenuGroup[];
}) {
  if (groups?.length) {
    return (
      <div className="grid gap-6">
        {groups.map((g) => (
          <section key={g.title}>
            <p className="text-caption mb-2 px-1">{g.title}</p>
            <ul className="df-card df-stagger divide-y divide-[var(--stroke)] overflow-hidden p-0">
              {g.items.map((m, i) => (
                <MenuRow key={m.href + m.label} item={m} i={i} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    );
  }

  return (
    <ul className="df-card df-stagger divide-y divide-[var(--stroke)] overflow-hidden p-0">
      {items.map((m, i) => (
        <MenuRow key={m.id} item={m} i={i} />
      ))}
    </ul>
  );
}

function MenuRow({ item, i }: { item: MenuLink; i: number }) {
  const Icon = item.icon;
  return (
    <li style={{ ["--df-i" as string]: i }}>
      <Link
        href={item.href}
        className={cn(
          "df-press flex items-center gap-3.5 px-4 py-3.5",
          "hover:bg-[color-mix(in_oklch,var(--brand-soft)_45%,transparent)]",
        )}
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-md)] border border-[var(--glass-line)] bg-[color-mix(in_oklch,var(--brand-soft)_75%,transparent)] text-kaffir backdrop-blur-[8px]">
          <Icon className="size-[1.15rem]" strokeWidth={2.1} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="text-title block truncate text-[1.05rem]">{item.label}</span>
          {item.hint ? <span className="text-caption mt-0.5 block truncate">{item.hint}</span> : null}
        </span>
        <ChevronRight className="size-4 shrink-0 text-ink-faint" aria-hidden />
      </Link>
    </li>
  );
}
