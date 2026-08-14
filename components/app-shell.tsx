"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { bottomNav, hubModule, modules } from "@/lib/modules";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SignOutButton } from "@/components/sign-out-button";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = [hubModule, ...modules];
  return (
    <nav className="grid gap-1">
      {items.map((m) => {
        const active = m.href === "/" ? pathname === "/" : pathname.startsWith(m.href);
        const Icon = m.icon;
        return (
          <Link
            key={m.id}
            href={m.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm",
              active ? "bg-kaffir text-paper" : "text-ink hover:bg-paper-2",
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="font-display">{m.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div className="min-h-dvh bg-paper md:grid md:grid-cols-[16.5rem_minmax(0,1fr)]">
      <aside className="hidden border-r border-line bg-paper-2 md:sticky md:top-0 md:flex md:h-dvh md:flex-col md:px-5 md:py-7">
        <p className="font-display text-2xl tracking-tight">day-flow</p>
        <p className="mt-1 text-sm text-ink-muted">สมุดบ้านประจำวัน</p>
        <div className="mt-8 flex-1 overflow-y-auto">
          <NavLinks />
        </div>
        <SignOutButton />
      </aside>

      <div className="flex min-h-dvh flex-col pb-20 md:pb-0">
        <header className="flex items-center justify-between border-b border-line px-4 py-3 md:px-8 md:py-5">
          <div className="flex items-center gap-2 md:hidden">
            <Sheet>
              <SheetTrigger className="rounded-md p-2 hover:bg-paper-2">
                <Menu className="size-5" />
              </SheetTrigger>
              <SheetContent side="left" title="โมดูล">
                <div className="mt-6">
                  <NavLinks />
                  <div className="mt-6">
                    <SignOutButton />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <p className="font-display text-lg">day-flow</p>
          </div>
          <h1 className="font-display text-xl md:text-3xl">{title}</h1>
          <div className="hidden md:block" />
        </header>
        <main className="flex-1 px-4 py-5 md:px-8 md:py-7">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-paper md:hidden">
        {bottomNav.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.id}
              href={m.href}
              className="flex flex-col items-center gap-1 py-2 text-[11px] text-ink-muted"
            >
              <Icon className="size-5" />
              {m.label}
            </Link>
          );
        })}
        <Sheet>
          <SheetTrigger className="flex flex-col items-center gap-1 py-2 text-[11px] text-ink-muted">
            <Menu className="size-5" />
            อื่นๆ
          </SheetTrigger>
          <SheetContent title="โมดูลทั้งหมด">
            <div className="mt-4 grid gap-2 pb-6">
              {modules.map((m) => {
                const Icon = m.icon;
                return (
                  <Link
                    key={m.id}
                    href={m.href}
                    className="flex items-center gap-3 rounded-lg border border-line bg-paper-2 px-3 py-3"
                  >
                    <Icon className="size-4" />
                    <span className="font-display">{m.label}</span>
                  </Link>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
}
