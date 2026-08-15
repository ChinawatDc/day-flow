"use client";

import { BottomNav } from "@/components/nav/bottom-nav";
import { SideRail } from "@/components/nav/side-rail";

export function AppShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div className="min-h-dvh bg-[radial-gradient(120%_80%_at_50%_-10%,#ebe4d6_0%,var(--paper)_55%)] md:bg-paper md:grid md:grid-cols-[16.5rem_minmax(0,1fr)]">
      <SideRail />
      <div className="flex min-h-dvh flex-col pb-8 md:pb-0">
        <header className="sticky top-0 z-30 border-b border-line/80 bg-paper/85 px-4 py-3 backdrop-blur-md md:static md:bg-transparent md:px-8 md:py-5 md:backdrop-blur-none">
          <div className="flex items-center justify-between gap-3">
            <p className="text-caption font-semibold tracking-wide text-kaffir md:hidden">day-flow</p>
            <h1 className="text-title text-xl md:text-3xl">{title}</h1>
            <div className="size-8 md:hidden" aria-hidden />
            <div className="hidden md:block" />
          </div>
        </header>
        <main className="flex-1 px-4 py-5 pb-28 md:px-8 md:py-7 md:pb-7">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
