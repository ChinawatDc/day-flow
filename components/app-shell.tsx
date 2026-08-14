"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { bottomNav, hubModule, modules, settingsModule } from "@/lib/modules";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SignOutButton } from "@/components/sign-out-button";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = [...modules, settingsModule];
  return (
    <nav className="grid gap-1">
      {items.map((m) => {
        const active = pathname === m.href || pathname.startsWith(`${m.href}/`);
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
            <span className="text-title text-[1.05rem]">{m.label}</span>
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
  const pathname = usePathname();
  return (
    <div className="min-h-dvh bg-paper md:grid md:grid-cols-[16.5rem_minmax(0,1fr)]">
      <aside className="hidden border-r border-line bg-paper-2 md:sticky md:top-0 md:flex md:h-dvh md:flex-col md:px-5 md:py-7">
        <p className="text-title text-2xl tracking-tight">day-flow</p>
        <p className="text-caption mt-1">สมุดบ้านประจำวัน</p>
        <div className="mt-8 flex-1 overflow-y-auto">
          <NavLinks />
        </div>
        <SignOutButton />
      </aside>

      <div className="flex min-h-dvh flex-col pb-20 md:pb-0">
        <header className="flex items-center justify-between border-b border-line px-4 py-3 md:px-8 md:py-5">
          <p className="text-title text-lg md:hidden">day-flow</p>
          <h1 className="text-title text-xl md:text-3xl">{title}</h1>
          <div className="hidden md:block" />
        </header>
        <main className="flex-1 px-4 py-5 md:px-8 md:py-7">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-paper md:hidden">
        {bottomNav.slice(0, 4).map((m) => {
          const Icon = m.icon;
          const active = pathname === m.href || pathname.startsWith(`${m.href}/`);
          return (
            <Link
              key={m.id}
              href={m.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2 text-[11px]",
                active ? "text-kaffir" : "text-ink-muted",
              )}
            >
              <Icon className="size-5" />
              {m.label}
            </Link>
          );
        })}
        <Sheet>
          <SheetTrigger className="flex flex-col items-center gap-1 py-2 text-[11px] text-ink-muted">
            <hubModule.icon className="size-5" />
            เมนู
          </SheetTrigger>
          <SheetContent title="ทุกบท">
            <div className="mt-4 grid gap-2 pb-6">
              {[...modules, settingsModule].map((m) => {
                const Icon = m.icon;
                return (
                  <Link
                    key={m.id}
                    href={m.href}
                    className="flex items-center gap-3 rounded-lg border border-line bg-paper-2 px-3 py-3"
                  >
                    <Icon className="size-4" />
                    <span className="text-title text-[1.05rem]">{m.label}</span>
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
