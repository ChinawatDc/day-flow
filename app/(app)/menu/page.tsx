import { AppShell } from "@/components/app-shell";
import { HubGrid } from "@/components/hub-grid";
import { requireUser } from "@/lib/session";
import { isoToThaiDisplay } from "@/lib/thai-date";
import { bangkokTodayIso } from "@/lib/utils";
import Link from "next/link";

export default async function MenuPage() {
  const user = await requireUser();
  return (
    <AppShell title="เมนู">
      <p className="text-caption mb-6">
        สวัสดี {user.name || user.email} · {isoToThaiDisplay(bangkokTodayIso())}
      </p>
      <HubGrid />
      <p className="mt-6">
        <Link href="/settings" className="text-sm text-kaffir underline">
          ตั้งค่าบัญชี
        </Link>
      </p>
    </AppShell>
  );
}
