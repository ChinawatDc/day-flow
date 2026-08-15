"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { modules, settingsModule } from "@/lib/modules";
import { navRailClass } from "@/components/nav/nav-class";
import { SignOutButton } from "@/components/sign-out-button";

export function SideRail() {
  const pathname = usePathname();
  const items = [...modules, settingsModule];
  return (
    <aside className="hidden border-r border-[var(--stroke)] bg-[color-mix(in_oklch,var(--surface-solid)_70%,var(--canvas))] md:sticky md:top-0 md:flex md:h-dvh md:flex-col md:px-4 md:py-7">
      <p className="text-title px-2 text-[1.65rem] tracking-tight">day-flow</p>
      <nav className="mt-8 flex-1 overflow-y-auto">
        <div className="grid gap-0.5">
          {items.map((m) => {
            const active = pathname === m.href || pathname.startsWith(`${m.href}/`);
            const Icon = m.icon;
            return (
              <Link key={m.id} href={m.href} className={navRailClass(active)}>
                <Icon className="size-4 shrink-0" strokeWidth={2.1} />
                <span className="text-title text-[1rem] font-medium">{m.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="px-1">
        <SignOutButton />
      </div>
    </aside>
  );
}
