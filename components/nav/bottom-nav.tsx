"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { bottomNav, hubModule, modules } from "@/lib/modules";
import { navTabClass } from "@/components/nav/nav-class";
import { cn } from "@/lib/utils";

const left = [bottomNav[0], bottomNav[1]];
const right = [bottomNav[3], bottomNav[4]];
const extra = ["/settings", "/vault", "/home", "/journal", "/family"];

export function BottomNav() {
  const pathname = usePathname();
  const menuActive =
    pathname === "/menu" || extra.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 md:hidden">
      <div className="mx-2 rounded-t-3xl border border-b-0 border-line bg-paper px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_28px_rgba(28,25,23,0.08)]">
        <div className="grid grid-cols-5 items-end">
          {left.map((m) => (
            <Tab key={m.id} href={m.href} label={m.label} icon={m.icon} active={isActive(pathname, m.href)} />
          ))}
          <Link href="/menu" className="relative flex flex-col items-center pb-0.5">
            <span
              className={cn(
                "-mt-6 flex size-14 items-center justify-center rounded-full shadow-md transition-transform duration-150 active:scale-95",
                menuActive ? "bg-kaffir text-paper" : "bg-paper-3 text-ink hover:bg-kaffir hover:text-paper",
              )}
            >
              <hubModule.icon className="size-6" />
            </span>
            <span className={cn("mt-1 text-[11px]", menuActive ? "text-kaffir" : "text-ink-muted")}>เมนู</span>
          </Link>
          {right.map((m) => (
            <Tab key={m.id} href={m.href} label={m.label} icon={m.icon} active={isActive(pathname, m.href)} />
          ))}
        </div>
      </div>
    </nav>
  );
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Tab({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: (typeof modules)[number]["icon"];
  active: boolean;
}) {
  return (
    <Link href={href} className={navTabClass(active)}>
      <Icon className="size-5" />
      {label}
    </Link>
  );
}
