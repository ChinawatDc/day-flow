import { Check } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { ConfirmDelete } from "@/components/notebook/confirm-delete";
import { ComposerSheet } from "@/components/notebook/composer-sheet";
import { FilterPills } from "@/components/notebook/filter-pills";
import { NotebookForm } from "@/components/notebook/notebook-form";
import { ProgressRing } from "@/components/notebook/progress-ring";
import { RecordList, RecordRow, SoftTag } from "@/components/notebook/record-row";
import { ToggleAction } from "@/components/notebook/toggle-action";
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
  const [rows, openRows, allRows] = await Promise.all([
    listTasks(user.id, filter, today),
    listTasks(user.id, "open", today),
    listTasks(user.id, "all", today),
  ]);
  const doneCount = allRows.filter((t) => t.doneAt).length;
  const total = allRows.length;
  const progress = total === 0 ? 0 : (doneCount / total) * 100;

  return (
    <AppShell title="งาน" trailing={<ProgressRing value={progress} size={52} stroke={6} />}>
      <section className="df-card-hero mb-5 flex items-center justify-between gap-4 p-5">
        <div>
          <p className="text-display text-[2rem] text-surface">{openRows.length}</p>
        </div>
        <div className="flex items-center gap-3">
          <ProgressRing value={progress} size={64} stroke={7} onDark />
          <ComposerSheet label="เพิ่ม" title="งานใหม่" variant="soft" compact>
            <NotebookForm action={createTask}>
              <Label htmlFor="title">ชื่องาน</Label>
              <Input id="title" name="title" required placeholder="เช่น จ่ายค่าไฟ" />
              <Label htmlFor="dueOn">วันครบ</Label>
              <Input id="dueOn" name="dueOn" type="date" defaultValue={today} />
              <Label htmlFor="note">โน้ต</Label>
              <Textarea id="note" name="note" placeholder="รายละเอียดสั้นๆ" />
              <Button type="submit">เพิ่มงาน</Button>
            </NotebookForm>
          </ComposerSheet>
        </div>
      </section>

      <FilterPills
        items={[
          { href: "/tasks?filter=today", label: "วันนี้", active: filter === "today" },
          { href: "/tasks?filter=open", label: "ค้าง", active: filter === "open" },
          { href: "/tasks?filter=all", label: "ทั้งหมด", active: filter === "all" },
        ]}
      />

      {rows.length === 0 ? (
        <EmptyState title="ยังไม่มีงาน" />
      ) : (
        <RecordList>
          {rows.map((t) => {
            const done = Boolean(t.doneAt);
            const overdue = !done && t.dueOn && t.dueOn < today;
            return (
              <RecordRow
                key={t.id}
                flush
                title={t.title}
                hint={t.note || undefined}
                done={done}
                leading={
                  <span
                    className={
                      done
                        ? "grid size-9 place-items-center rounded-full bg-kaffir text-surface"
                        : "grid size-9 place-items-center rounded-full border border-[var(--stroke-strong)] bg-paper-2 text-transparent"
                    }
                    aria-hidden
                  >
                    <Check className="size-4" strokeWidth={2.5} />
                  </span>
                }
                tag={
                  <>
                    <SoftTag tone={overdue ? "orange" : "kaffir"}>
                      {isoToThaiShort(t.dueOn) || "ไม่กำหนด"}
                    </SoftTag>
                    {done ? <SoftTag>เสร็จแล้ว</SoftTag> : null}
                    {overdue ? <SoftTag tone="orange">ค้าง</SoftTag> : null}
                  </>
                }
                actions={
                  <>
                    <ToggleAction
                      action={toggleTask}
                      id={t.id}
                      name="done"
                      value={done ? "0" : "1"}
                      label={done ? "เปิด" : "เสร็จ"}
                      variant={done ? "outline" : "default"}
                    />
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
            );
          })}
        </RecordList>
      )}
    </AppShell>
  );
}
