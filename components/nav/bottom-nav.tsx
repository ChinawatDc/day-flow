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
  if (pathname.startsWith("/family/hunt")) return null;
  const menuActive =
    pathname === "/menu" || extra.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.55rem,env(safe-area-inset-bottom))] md:hidden">
      <div className="df-nav-float mx-auto max-w-lg px-1.5 pt-1.5">
        <div className="grid grid-cols-5 items-end pb-1">
          {left.map((m) => (
            <Tab key={m.id} href={m.href} label={m.label} icon={m.icon} active={isActive(pathname, m.href)} />
          ))}
          <Link href="/menu" className="df-press relative flex flex-col items-center pb-0.5">
            <span
              className={cn(
                "-mt-6 flex size-12 items-center justify-center rounded-full shadow-[var(--shadow-md)]",
                menuActive ? "bg-kaffir text-surface" : "bg-ink text-surface",
              )}
            >
              <hubModule.icon className="size-5" strokeWidth={2.1} />
            </span>
            <span className={cn("mt-1 text-[10px] font-medium", menuActive ? "text-kaffir" : "text-ink-muted")}>
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
        "df-press flex flex-col items-center justify-center gap-0.5 rounded-[var(--radius-md)] px-1 py-2 text-[10px] font-medium",
        active ? "text-kaffir" : "text-ink-muted hover:text-ink",
      )}
    >
      <span
        className={cn(
          "grid size-8 place-items-center rounded-[var(--radius-md)] transition-colors",
          active ? "bg-kaffir-soft" : "bg-transparent",
        )}
      >
        <Icon className="size-[1.15rem]" strokeWidth={2.1} />
      </span>
      {label}
    </Link>
  );
}
