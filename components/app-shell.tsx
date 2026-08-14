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
    <div className="min-h-dvh bg-paper md:grid md:grid-cols-[16.5rem_minmax(0,1fr)]">
      <SideRail />
      <div className="flex min-h-dvh flex-col pb-8 md:pb-0">
        <header className="flex items-center justify-between border-b border-line px-4 py-3 md:px-8 md:py-5">
          <p className="text-title text-lg md:hidden">day-flow</p>
          <h1 className="text-title text-xl md:text-3xl">{title}</h1>
          <div className="hidden md:block" />
        </header>
        <main className="flex-1 px-4 py-5 pb-28 md:px-8 md:py-7 md:pb-7">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
