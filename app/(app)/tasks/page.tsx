import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { ConfirmDelete } from "@/components/notebook/confirm-delete";
import { EditPanel } from "@/components/notebook/edit-panel";
import { NotebookForm } from "@/components/notebook/notebook-form";
import { RecordRow } from "@/components/notebook/record-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createTask, deleteTask, toggleTask, updateTask } from "./actions";
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
      <NotebookForm action={createTask}>
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
      </NotebookForm>

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
        <ul className="grid gap-3">
          {rows.map((t) => (
            <RecordRow
              key={t.id}
              title={t.title}
              hint={isoToThaiShort(t.dueOn)}
              done={Boolean(t.doneAt)}
              actions={
                <>
                  <form action={toggleTask}>
                    <input type="hidden" name="id" value={t.id} />
                    <input type="hidden" name="done" value={t.doneAt ? "0" : "1"} />
                    <Button size="sm" variant="outline">
                      {t.doneAt ? "ยังไม่เสร็จ" : "เสร็จ"}
                    </Button>
                  </form>
                  <EditPanel>
                    <form action={updateTask} className="grid gap-2">
                      <input type="hidden" name="id" value={t.id} />
                      <Input name="title" defaultValue={t.title} required />
                      <Input name="dueOn" type="date" defaultValue={t.dueOn ?? ""} />
                      <Textarea name="note" defaultValue={t.note} />
                      <Button type="submit" size="sm">
                        บันทึก
                      </Button>
                    </form>
                  </EditPanel>
                  <ConfirmDelete action={deleteTask} id={t.id} />
                </>
              }
            />
          ))}
        </ul>
      )}
    </AppShell>
  );
}
