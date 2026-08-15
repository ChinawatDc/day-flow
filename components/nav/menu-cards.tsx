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
            <Link href={m.href} className={cn("df-card df-press flex h-full items-center gap-3 p-4")}>
              <span className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-kaffir-soft text-kaffir">
                <Icon className="size-5" />
              </span>
              <span className="text-title truncate text-[1.05rem]">{m.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
