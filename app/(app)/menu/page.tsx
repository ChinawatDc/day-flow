import { AppShell } from "@/components/app-shell";
import { MenuCards } from "@/components/nav/menu-cards";
import { requireUser } from "@/lib/session";
import { isoToThaiDisplay } from "@/lib/thai-date";
import { bangkokTodayIso } from "@/lib/utils";

export default async function MenuPage() {
  const user = await requireUser();
  return (
    <AppShell title="เมนู">
      <p className="text-caption mb-4">
        {user.name || user.email} · {isoToThaiDisplay(bangkokTodayIso())}
      </p>
      <MenuCards />
    </AppShell>
  );
}
