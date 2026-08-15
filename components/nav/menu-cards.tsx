import Link from "next/link";
import { modules, settingsModule, type AppModule } from "@/lib/modules";
import { cn } from "@/lib/utils";

export function MenuCards({
  items = [...modules, settingsModule],
}: {
  items?: AppModule[];
}) {
  return (
    <ul className="grid grid-cols-2 gap-3">
      {items.map((m) => {
        const Icon = m.icon;
        return (
          <li key={m.id}>
            <Link
              href={m.href}
              className={cn(
                "flex h-full flex-col gap-3 rounded-[1.35rem] border border-line/70 bg-surface p-4 shadow-[var(--shadow-card)]",
                "transition-transform duration-150 hover:border-kaffir/30 active:scale-[0.98]",
              )}
            >
              <span className="flex size-11 items-center justify-center rounded-2xl bg-kaffir-soft text-kaffir">
                <Icon className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="text-title block text-[1.05rem]">{m.label}</span>
                <span className="text-caption mt-1 block line-clamp-2">{m.blurb}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
