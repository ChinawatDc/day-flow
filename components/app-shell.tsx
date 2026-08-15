"use client";

import { BottomNav } from "@/components/nav/bottom-nav";
import { SideRail } from "@/components/nav/side-rail";

export function AppShell({
  children,
  title,
  subtitle,
  trailing,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-[radial-gradient(110%_70%_at_50%_-8%,#e8f0ea_0%,var(--paper)_48%)] md:bg-paper md:grid md:grid-cols-[16.5rem_minmax(0,1fr)]">
      <SideRail />
      <div className="flex min-h-dvh flex-col pb-8 md:pb-0">
        <header className="sticky top-0 z-30 border-b border-line/50 bg-paper/80 px-4 py-3.5 backdrop-blur-md md:static md:border-0 md:bg-transparent md:px-8 md:py-6 md:backdrop-blur-none">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-kaffir uppercase md:hidden">day-flow</p>
              <h1 className="text-title truncate text-[1.35rem] md:text-3xl">{title}</h1>
              {subtitle ? <div className="text-caption mt-0.5 truncate">{subtitle}</div> : null}
            </div>
            {trailing ? <div className="shrink-0">{trailing}</div> : <div className="size-10 md:hidden" aria-hidden />}
          </div>
        </header>
        <main className="flex-1 px-4 py-5 pb-32 md:px-8 md:py-7 md:pb-7">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
