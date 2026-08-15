import { AmountText } from "@/components/notebook/amount-text";
import { AppShell } from "@/components/app-shell";
import { MenuCards } from "@/components/nav/menu-cards";
import { OverviewCard } from "@/components/notebook/overview-card";
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
  const rest = [...modules.filter((m) => m.id !== "today"), settingsModule];
  const initial = (user.name || user.email || "?").slice(0, 1).toUpperCase();

  return (
    <AppShell
      title={`สวัสดี${user.name ? ` ${user.name.split(" ")[0]}` : ""}`}
      subtitle={isoToThaiDisplay(today)}
      trailing={
        <div className="grid size-11 place-items-center rounded-full bg-kaffir text-base font-bold text-paper shadow-[var(--shadow-card)]">
          {initial}
        </div>
      }
    >
      <section className="df-card mb-5 flex items-center justify-between gap-4 p-4">
        <div>
          <p className="text-title mt-1 text-lg">
            {doneTasks}/{allTasks.length || 0}
          </p>
        </div>
        <ProgressRing value={progress} size={76} stroke={8} />
      </section>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <OverviewCard
          href="/today"
          tone="kaffir"
          title="วันนี้"
          value={<AmountText satang={snap.spentToday} />}
        />
        <OverviewCard href="/tasks" title="งานค้าง" value={String(openTasks)} />
      </div>

      <MenuCards items={rest} />
    </AppShell>
  );
}
