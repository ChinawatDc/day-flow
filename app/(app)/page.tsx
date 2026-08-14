import { AppShell } from "@/components/app-shell";
import { HubGrid } from "@/components/hub-grid";
import { requireUser } from "@/lib/session";
import { isoToThaiDisplay } from "@/lib/thai-date";
import { bangkokTodayIso } from "@/lib/utils";

export default async function HubPage() {
  const user = await requireUser();
  return (
    <AppShell title="เมนู">
      <p className="mb-6 text-ink-muted">
        สวัสดี {user.name || user.email} · {isoToThaiDisplay(bangkokTodayIso())}
      </p>
      <HubGrid />
    </AppShell>
  );
}
