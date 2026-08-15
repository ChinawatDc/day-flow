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
    <div className="df-canvas min-h-dvh md:grid md:grid-cols-[15.5rem_minmax(0,1fr)]">
      <SideRail />
      <div className="flex min-h-dvh flex-col pb-8 md:pb-0">
        <header className="sticky top-0 z-30 border-b border-[var(--glass-line)] bg-[color-mix(in_oklch,var(--surface-solid)_55%,transparent)] px-4 py-4 backdrop-blur-[var(--blur-nav)] saturate-[118%] md:static md:border-0 md:bg-transparent md:px-8 md:pt-8 md:pb-4 md:backdrop-blur-none md:saturate-100">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0 df-enter">
              <h1 className="text-title truncate text-[1.5rem] tracking-tight md:text-[1.75rem]">{title}</h1>
              {subtitle ? <div className="text-caption mt-1 truncate">{subtitle}</div> : null}
            </div>
            {trailing ? <div className="mb-0.5 shrink-0">{trailing}</div> : null}
          </div>
        </header>
        <main className="df-enter flex-1 px-4 pt-5 pb-32 md:px-8 md:pt-6 md:pb-8">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
