import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { AmountText } from "@/components/notebook/amount-text";
import { MenuCards } from "@/components/nav/menu-cards";
import { getTodaySnapshot } from "@/lib/data";
import { modules, settingsModule } from "@/lib/modules";
import { requireUser } from "@/lib/session";
import { isoToThaiDisplay } from "@/lib/thai-date";
import { bangkokTodayIso } from "@/lib/utils";

export default async function MenuPage() {
  const user = await requireUser();
  const snap = await getTodaySnapshot(user.id);
  const pending =
    snap.todayTasks.length +
    snap.overdueTasks.length +
    snap.billsThisMonth.length +
    snap.expiring.length +
    snap.unfiledCount;
  const rest = [...modules.filter((m) => m.id !== "today"), settingsModule];

  return (
    <AppShell title="สวัสดี">
      <p className="text-caption mb-5">
        {user.name || user.email} · {isoToThaiDisplay(bangkokTodayIso())}
      </p>
      <Link
        href="/today"
        className="mb-6 block rounded-3xl bg-kaffir p-5 text-paper transition-transform duration-150 hover:bg-kaffir-dark active:scale-[0.99]"
      >
        <p className="text-sm text-paper/80">วันนี้</p>
        <p className="text-display mt-1">
          <AmountText satang={snap.spentToday} />
        </p>
        <p className="mt-2 text-sm text-paper/85">
          {pending > 0 ? `${pending} อย่างที่ต้องทำ` : "โล่ง — เปิดวันนี้"}
        </p>
      </Link>
      <MenuCards items={rest} />
    </AppShell>
  );
}
