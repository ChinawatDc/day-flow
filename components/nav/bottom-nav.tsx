"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { bottomNav, hubModule, modules } from "@/lib/modules";
import { MenuCards } from "@/components/nav/menu-cards";
import { navTabClass } from "@/components/nav/nav-class";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const left = [bottomNav[0], bottomNav[1]];
const right = [bottomNav[3], bottomNav[4]];
const extra = ["/menu", "/settings", "/vault", "/home", "/journal", "/family"];

export function BottomNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuActive = open || extra.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 gap-1 border-t border-line bg-paper px-2 pb-[env(safe-area-inset-bottom)] pt-1 md:hidden">
      {left.map((m) => (
        <Tab key={m.id} href={m.href} label={m.label} icon={m.icon} active={isActive(pathname, m.href)} />
      ))}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger className={navTabClass(menuActive)}>
          <hubModule.icon className="size-5" />
          เมนู
        </SheetTrigger>
        <SheetContent title="ทุกบท" className="pb-8">
          <div className="mt-4">
            <MenuCards closeOnClick />
          </div>
        </SheetContent>
      </Sheet>
      {right.map((m) => (
        <Tab key={m.id} href={m.href} label={m.label} icon={m.icon} active={isActive(pathname, m.href)} />
      ))}
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
