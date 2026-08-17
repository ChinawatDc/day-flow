"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, CalendarDays, Columns3, LayoutList, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/family/hunt", label: "ตาราง", icon: LayoutList, exact: true },
  { href: "/family/hunt/compare", label: "เทียบ", icon: Columns3 },
  { href: "/family/hunt/shortlist", label: "shortlist", icon: Star },
  { href: "/family/hunt/visits", label: "นัดดู", icon: CalendarDays },
] as const;

function tabActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function HuntShell({
  familyName,
  children,
}: {
  familyName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const title =
    tabs.find((t) => tabActive(pathname, t.href, "exact" in t && t.exact))?.label ?? "เลือกบ้าน";

  return (
    <div className="hh-shell flex min-h-dvh flex-col md:grid md:grid-cols-[13.5rem_minmax(0,1fr)]">
      <aside className="hh-nav hidden border-r md:sticky md:top-0 md:flex md:h-dvh md:flex-col md:px-4 md:py-7">
        <Link href="/family" className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--hh-muted)]">
          <ArrowLeft className="size-4" />
          ครอบครัว
        </Link>
        <p className="px-2 font-[family-name:var(--font-title)] text-xl font-semibold tracking-tight">เลือกบ้าน</p>
        <p className="text-caption mt-1 truncate px-2">{familyName}</p>
        <nav className="mt-8 grid gap-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tabActive(pathname, t.href, "exact" in t && t.exact);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium",
                  active ? "bg-[var(--hh-gold-soft)] text-[var(--hh-gold)]" : "text-[var(--hh-muted)]",
                )}
              >
                <Icon className="size-4" strokeWidth={2.1} />
                {t.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-h-dvh flex-col pb-8 md:pb-0">
        <header className="hh-nav sticky top-0 z-30 px-4 py-3 md:static md:border-0 md:bg-transparent md:px-8 md:pt-8 md:backdrop-filter-none">
          <div className="flex items-center gap-3 md:hidden">
            <Link href="/family" className="grid size-9 place-items-center rounded-full border border-[var(--hh-line)]">
              <ArrowLeft className="size-4" />
            </Link>
            <div className="min-w-0">
              <h1 className="truncate font-[family-name:var(--font-title)] text-lg font-semibold">{title}</h1>
              <p className="text-caption truncate">{familyName}</p>
            </div>
          </div>
          <div className="hidden md:block">
            <h1 className="font-[family-name:var(--font-title)] text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-caption mt-1">ราคาเริ่มต้นที่พบ ไม่ใช่ราคาแปลงจริง</p>
          </div>
        </header>
        <main className="flex-1 px-4 pt-4 pb-28 md:px-8 md:pt-2 md:pb-10">{children}</main>
      </div>

      <nav className="hh-nav fixed inset-x-3 bottom-[max(0.55rem,env(safe-area-inset-bottom))] z-40 rounded-2xl px-2 py-2 md:hidden">
        <div className="grid grid-cols-4">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tabActive(pathname, t.href, "exact" in t && t.exact);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-1.5 text-[10px] font-medium",
                  active ? "text-[var(--hh-gold)]" : "text-[var(--hh-muted)]",
                )}
              >
                <Icon className="size-5" strokeWidth={2.1} />
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
