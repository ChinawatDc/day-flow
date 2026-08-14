import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { ConfirmDelete } from "@/components/notebook/confirm-delete";
import { ComposerSheet } from "@/components/notebook/composer-sheet";
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
  const today = bangkokTodayIso();
  const rows = await listTasks(user.id, filter, today);

  return (
    <AppShell title="งาน">
      <div className="mb-4">
        <ComposerSheet label="เพิ่มงาน" title="งานใหม่">
          <NotebookForm action={createTask}>
            <Label htmlFor="title">ชื่องาน</Label>
            <Input id="title" name="title" required />
            <Label htmlFor="dueOn">วันครบ</Label>
            <Input id="dueOn" name="dueOn" type="date" defaultValue={today} />
            <Label htmlFor="note">โน้ต</Label>
            <Textarea id="note" name="note" />
            <Button type="submit">เพิ่มงาน</Button>
          </NotebookForm>
        </ComposerSheet>
      </div>
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
        <EmptyState title="ยังไม่มีงาน" hint="กดเพิ่มงานด้านบน" />
      ) : (
        <ul className="grid gap-2">
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
                      {t.doneAt ? "เปิด" : "เสร็จ"}
                    </Button>
                  </form>
                  <ComposerSheet label="แก้" title="แก้งาน" variant="outline" compact>
                    <NotebookForm action={updateTask}>
                      <input type="hidden" name="id" value={t.id} />
                      <Input name="title" defaultValue={t.title} required />
                      <Input name="dueOn" type="date" defaultValue={t.dueOn ?? ""} />
                      <Textarea name="note" defaultValue={t.note} />
                      <Button type="submit" size="sm">
                        บันทึก
                      </Button>
                    </NotebookForm>
                  </ComposerSheet>
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
