"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { bottomNav, hubModule, modules } from "@/lib/modules";
import { cn } from "@/lib/utils";

const left = [bottomNav[0], bottomNav[1]];
const right = [bottomNav[3], bottomNav[4]];
const extra = ["/settings", "/vault", "/home", "/journal", "/family"];

export function BottomNav() {
  const pathname = usePathname();
  const menuActive =
    pathname === "/menu" || extra.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.65rem,env(safe-area-inset-bottom))] md:hidden">
      <div className="mx-auto max-w-lg rounded-[1.75rem] border border-line/60 bg-surface/95 px-2 pt-2 shadow-[var(--shadow-float)] backdrop-blur-md">
        <div className="grid grid-cols-5 items-end pb-1">
          {left.map((m) => (
            <Tab key={m.id} href={m.href} label={m.label} icon={m.icon} active={isActive(pathname, m.href)} />
          ))}
          <Link href="/menu" className="relative flex flex-col items-center pb-0.5">
            <span
              className={cn(
                "-mt-7 flex size-14 items-center justify-center rounded-full shadow-[var(--shadow-float)] transition-transform duration-150 active:scale-95",
                menuActive ? "bg-kaffir text-paper" : "bg-ink text-paper",
              )}
            >
              <hubModule.icon className="size-6" />
            </span>
            <span className={cn("mt-1 text-[11px] font-medium", menuActive ? "text-kaffir" : "text-ink-muted")}>
              เมนู
            </span>
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
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-2 text-[11px] font-medium transition-colors duration-150 active:scale-95",
        active ? "text-kaffir" : "text-ink-muted hover:text-ink",
      )}
    >
      <span
        className={cn(
          "grid size-9 place-items-center rounded-2xl transition-colors",
          active ? "bg-kaffir-soft" : "bg-transparent",
        )}
      >
        <Icon className="size-5" />
      </span>
      {label}
    </Link>
  );
}
