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
    <aside className="hidden border-r border-line bg-paper-2 md:sticky md:top-0 md:flex md:h-dvh md:flex-col md:px-5 md:py-7">
      <p className="text-title text-2xl tracking-tight">day-flow</p>
      <p className="text-caption mt-1">สมุดบ้านประจำวัน</p>
      <nav className="mt-8 flex-1 overflow-y-auto">
        <div className="grid gap-1">
          {items.map((m) => {
            const active = pathname === m.href || pathname.startsWith(`${m.href}/`);
            const Icon = m.icon;
            return (
              <Link key={m.id} href={m.href} className={navRailClass(active)}>
                <Icon className="size-4 shrink-0" />
                <span className="text-title text-[1.05rem]">{m.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      <SignOutButton />
    </aside>
  );
}
