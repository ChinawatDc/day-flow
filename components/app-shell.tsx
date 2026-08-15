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
    <div className="df-canvas min-h-dvh md:grid md:grid-cols-[16.5rem_minmax(0,1fr)] md:bg-canvas">
      <SideRail />
      <div className="flex min-h-dvh flex-col pb-8 md:pb-0">
        <header className="sticky top-0 z-30 border-b border-[var(--stroke)] bg-[color-mix(in_srgb,var(--canvas)_78%,transparent)] px-4 py-3.5 backdrop-blur-[var(--blur-nav)] md:static md:border-0 md:bg-transparent md:px-8 md:py-6 md:backdrop-blur-none">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 df-enter">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-kaffir uppercase md:hidden">
                day-flow
              </p>
              <h1 className="text-title truncate text-[1.35rem] md:text-3xl">{title}</h1>
              {subtitle ? <div className="text-caption mt-0.5 truncate">{subtitle}</div> : null}
            </div>
            {trailing ? <div className="shrink-0">{trailing}</div> : <div className="size-10 md:hidden" aria-hidden />}
          </div>
        </header>
        <main className="df-enter flex-1 px-4 py-5 pb-32 md:px-8 md:py-7 md:pb-7">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
