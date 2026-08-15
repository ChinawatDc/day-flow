import { CalendarDays, MessageCircle } from "lucide-react";
import { AmountText } from "@/components/notebook/amount-text";
import { AppShell } from "@/components/app-shell";
import { MenuCards } from "@/components/nav/menu-cards";
import { ProgressRing } from "@/components/notebook/progress-ring";
import { getTodaySnapshot } from "@/lib/data";
import { listTasks } from "@/lib/data";
import { modules, settingsModule } from "@/lib/modules";
import { requireUser } from "@/lib/session";
import { isoToThaiDisplay } from "@/lib/thai-date";
import { bangkokTodayIso } from "@/lib/utils";

export default async function MenuPage() {
  const user = await requireUser();
  const today = bangkokTodayIso();
  const [snap, allTasks] = await Promise.all([
    getTodaySnapshot(user.id),
    listTasks(user.id, "all", today),
  ]);
  const openTasks = allTasks.filter((t) => !t.doneAt).length;
  const doneTasks = allTasks.filter((t) => t.doneAt).length;
  const progress = allTasks.length === 0 ? 0 : (doneTasks / allTasks.length) * 100;
  const byId = Object.fromEntries(modules.map((m) => [m.id, m]));
  const initial = (user.name || user.email || "?").slice(0, 1).toUpperCase();
  const first = user.name?.split(" ")[0];

  return (
    <AppShell
      title={first ? `สวัสดี ${first}` : "สวัสดี"}
      subtitle={isoToThaiDisplay(today)}
      trailing={
        <div className="grid size-11 place-items-center rounded-full bg-kaffir text-base font-bold text-surface shadow-[var(--shadow-sm)]">
          {initial}
        </div>
      }
    >
      <section className="df-card-hero mb-6 flex items-center justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-sm text-surface/75">วันนี้</p>
          <p className="text-display mt-1 truncate text-[1.85rem] text-surface">
            <AmountText satang={snap.spentToday} />
          </p>
          <p className="mt-2 text-sm text-surface/80">{openTasks} งานค้าง</p>
        </div>
        <ProgressRing value={progress} size={72} stroke={7} onDark />
      </section>

      <MenuCards
        groups={[
          {
            title: "ครอบครัว",
            items: [
              { ...byId.family, hint: "บ้านและสมาชิก" },
              {
                href: "/family?tab=plan",
                label: "วางแผนบ้าน",
                hint: "งาน · ซื้อของ · นัดหมาย",
                icon: CalendarDays,
              },
              {
                href: "/family?tab=talk",
                label: "คุยกับบ้าน",
                hint: "กลุ่มและแชทรายคน",
                icon: MessageCircle,
              },
            ],
          },
          {
            title: "สมุด",
            items: [byId.inbox, byId.tasks, byId.money, byId.vault, byId.home, byId.journal],
          },
          {
            title: "ระบบ",
            items: [settingsModule],
          },
        ]}
      />
    </AppShell>
  );
}
