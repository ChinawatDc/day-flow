import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createTask, deleteTask, toggleTask } from "./actions";
import { listTasks } from "@/lib/data";
import { requireUser } from "@/lib/session";
import { isoToThaiShort } from "@/lib/thai-date";
import { bangkokTodayIso } from "@/lib/utils";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const user = await requireUser();
  const { filter = "open" } = await searchParams;
  const all = await listTasks(user.id);
  const today = bangkokTodayIso();
  const rows = all.filter((t) => {
    if (filter === "today") return t.dueOn === today && !t.doneAt;
    if (filter === "open") return !t.doneAt;
    return true;
  });

  return (
    <AppShell title="งาน">
      <form action={createTask} className="mb-8 grid gap-3 rounded-xl border border-line bg-paper-2 p-4 md:max-w-xl">
        <div className="grid gap-1.5">
          <Label htmlFor="title">ชื่องาน</Label>
          <Input id="title" name="title" required />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="dueOn">วันครบ</Label>
          <Input id="dueOn" name="dueOn" type="date" defaultValue={today} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="note">โน้ต</Label>
          <Textarea id="note" name="note" />
        </div>
        <Button type="submit">เพิ่มงาน</Button>
      </form>

      <div className="mb-4 flex gap-2 text-sm">
        <a className={filter === "today" ? "text-kaffir" : "text-ink-muted"} href="/tasks?filter=today">
          วันนี้
        </a>
        <a className={filter === "open" ? "text-kaffir" : "text-ink-muted"} href="/tasks?filter=open">
          ค้าง
        </a>
        <a className={filter === "all" ? "text-kaffir" : "text-ink-muted"} href="/tasks?filter=all">
          ทั้งหมด
        </a>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="ยังไม่มีงาน" hint="เพิ่มงานด้านบน" />
      ) : (
        <>
          <ul className="grid gap-3 lg:hidden">
            {rows.map((t) => (
              <li key={t.id} className="rounded-xl border border-line p-4">
                <p className={t.doneAt ? "text-ink-muted line-through" : "font-medium"}>{t.title}</p>
                <p className="mt-1 text-sm text-ink-muted">{isoToThaiShort(t.dueOn)}</p>
                <div className="mt-3 flex gap-2">
                  <form action={toggleTask}>
                    <input type="hidden" name="id" value={t.id} />
                    <input type="hidden" name="done" value={t.doneAt ? "0" : "1"} />
                    <Button size="sm" variant="outline">
                      {t.doneAt ? "ยังไม่เสร็จ" : "เสร็จ"}
                    </Button>
                  </form>
                  <form action={deleteTask}>
                    <input type="hidden" name="id" value={t.id} />
                    <Button size="sm" variant="ghost">
                      ลบ
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
          <div className="hidden lg:block">
            <table className="w-full text-left">
              <thead className="border-b border-line text-sm text-ink-muted">
                <tr>
                  <th className="py-2">งาน</th>
                  <th>วันครบ</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id} className="border-b border-line/70">
                    <td className="py-3">{t.title}</td>
                    <td>{isoToThaiShort(t.dueOn)}</td>
                    <td className="text-right">
                      <form action={toggleTask} className="mr-2 inline">
                        <input type="hidden" name="id" value={t.id} />
                        <input type="hidden" name="done" value={t.doneAt ? "0" : "1"} />
                        <Button size="sm" variant="outline">
                          {t.doneAt ? "เปิด" : "เสร็จ"}
                        </Button>
                      </form>
                      <form action={deleteTask} className="inline">
                        <input type="hidden" name="id" value={t.id} />
                        <Button size="sm" variant="ghost">
                          ลบ
                        </Button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AppShell>
  );
}
