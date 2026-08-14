import Link from "next/link";
import { modules, settingsModule, type AppModule } from "@/lib/modules";
import { cn } from "@/lib/utils";

export function MenuCards({
  items = [...modules, settingsModule],
}: {
  items?: AppModule[];
}) {
  return (
    <ul className="grid gap-2">
      {items.map((m) => {
        const Icon = m.icon;
        return (
          <li key={m.id}>
            <Link
              href={m.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl border border-line bg-paper px-3 py-3.5 transition-transform duration-150",
                "hover:bg-paper-3 active:scale-[0.98]",
              )}
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-paper-2 text-kaffir">
                <Icon className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="text-title block text-base">{m.label}</span>
                <span className="text-caption mt-0.5 block truncate">{m.blurb}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
