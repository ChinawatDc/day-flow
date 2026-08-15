import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { AmountText } from "@/components/notebook/amount-text";
import { CategorySelect } from "@/components/notebook/category-select";
import { ComposerSheet } from "@/components/notebook/composer-sheet";
import { NotebookForm } from "@/components/notebook/notebook-form";
import { ProgressRing } from "@/components/notebook/progress-ring";
import { RecordList, RecordRow, SoftTag } from "@/components/notebook/record-row";
import { StatStrip } from "@/components/notebook/stat-strip";
import { ToggleAction } from "@/components/notebook/toggle-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createExpense } from "@/app/(app)/money/actions";
import { toggleTask } from "@/app/(app)/tasks/actions";
import { toggleBill } from "@/app/(app)/home/actions";
import { getTodaySnapshot, listTasks, searchNotebook } from "@/lib/data";
import { requireUser } from "@/lib/session";
import { isoToThaiDisplay, isoToThaiShort } from "@/lib/thai-date";
import { bangkokTodayIso } from "@/lib/utils";

export default async function TodayPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireUser();
  const { q = "" } = await searchParams;
  const today = bangkokTodayIso();
  const [snap, allTasks] = await Promise.all([
    getTodaySnapshot(user.id),
    listTasks(user.id, "all", today),
  ]);
  const found = q.trim() ? await searchNotebook(user.id, q) : null;
  const openTasks = allTasks.filter((t) => !t.doneAt).length;
  const doneTasks = allTasks.filter((t) => t.doneAt).length;
  const progress = allTasks.length === 0 ? 0 : (doneTasks / allTasks.length) * 100;
  const hasWork =
    snap.todayTasks.length +
      snap.overdueTasks.length +
      snap.billsThisMonth.length +
      snap.expiring.length >
    0;

  return (
    <AppShell
      title="วันนี้"
      subtitle={isoToThaiDisplay(snap.today)}
      trailing={<ProgressRing value={progress} size={52} stroke={6} />}
    >
      <StatStrip
        items={[
          { label: "จ่าย", value: <AmountText satang={snap.spentToday} />, emphasize: true },
          { label: "งานค้าง", value: String(openTasks), href: "/tasks" },
        ]}
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <ComposerSheet label="จ่าย" title="จดรายจ่าย" variant="soft" compact>
          <NotebookForm action={createExpense}>
            <Label htmlFor="amount">จำนวนบาท</Label>
            <Input id="amount" name="amount" inputMode="decimal" required placeholder="120" />
            <CategorySelect label={null} />
            <Input name="merchant" placeholder="ร้าน" />
            <input type="hidden" name="spentOn" value={today} />
            <Button type="submit" variant="orange">
              บันทึกจ่าย
            </Button>
          </NotebookForm>
        </ComposerSheet>
        <Chip href="/inbox" label="จด" count={snap.unfiledCount} alert={snap.staleCount > 0} />
        <Chip href="/journal" label={snap.hasJournal ? "บันทึกแล้ว" : "บันทึก"} />
      </div>

      <form action="/today" className="mb-5">
        <Input id="q" name="q" defaultValue={q} placeholder="ค้นงาน เงิน คลัง จด" className="h-12" />
      </form>

      {found ? (
        <section className="mb-6">
          <p className="text-title mb-3 text-base">ผลค้น</p>
          {found.tasks.length + found.expenses.length + found.vault.length + found.captures.length === 0 ? (
            <p className="text-caption">ไม่พบ</p>
          ) : (
            <RecordList>
              {found.tasks.map((t) => (
                <RecordRow
                  key={t.id}
                  flush
                  title={t.title}
                  tag={<SoftTag tone="kaffir">งาน</SoftTag>}
                  actions={
                    <Button asChild size="sm" variant="outline">
                      <Link href="/tasks">เปิด</Link>
                    </Button>
                  }
                />
              ))}
              {found.expenses.map((e) => (
                <RecordRow
                  key={e.id}
                  flush
                  title={e.merchant || "รายจ่าย"}
                  value={<AmountText satang={e.amountSatang} />}
                  tag={<SoftTag>เงิน</SoftTag>}
                  actions={
                    <Button asChild size="sm" variant="outline">
                      <Link href="/money">เปิด</Link>
                    </Button>
                  }
                />
              ))}
              {found.vault.map((v) => (
                <RecordRow
                  key={v.id}
                  flush
                  title={v.title}
                  tag={<SoftTag>คลัง</SoftTag>}
                  actions={
                    <Button asChild size="sm" variant="outline">
                      <Link href="/vault">เปิด</Link>
                    </Button>
                  }
                />
              ))}
              {found.captures.map((c) => (
                <RecordRow
                  key={c.id}
                  flush
                  title={c.note || "จดด่วน"}
                  tag={<SoftTag tone="orange">จด</SoftTag>}
                  actions={
                    <Button asChild size="sm" variant="outline">
                      <Link href="/inbox">เปิด</Link>
                    </Button>
                  }
                />
              ))}
            </RecordList>
          )}
        </section>
      ) : null}

      {!found && !hasWork ? (
        <EmptyState title="วันนี้โล่ง">
          <Button asChild variant="outline">
            <Link href="/inbox">จด</Link>
          </Button>
          <Button asChild>
            <Link href="/tasks">เพิ่มงาน</Link>
          </Button>
        </EmptyState>
      ) : null}

      {!found && snap.overdueTasks.length > 0 ? (
        <Group title="งานค้างข้ามวัน">
          <RecordList>
            {snap.overdueTasks.map((t) => (
              <RecordRow
                key={t.id}
                flush
                title={t.title}
                tag={<SoftTag tone="orange">{isoToThaiShort(t.dueOn)}</SoftTag>}
                actions={<DoneForm id={t.id} />}
              />
            ))}
          </RecordList>
        </Group>
      ) : null}

      {!found && snap.todayTasks.length > 0 ? (
        <Group title="งานวันนี้">
          <RecordList>
            {snap.todayTasks.map((t) => (
              <RecordRow
                key={t.id}
                flush
                title={t.title}
                tag={<SoftTag tone="kaffir">{isoToThaiShort(t.dueOn)}</SoftTag>}
                actions={<DoneForm id={t.id} />}
              />
            ))}
          </RecordList>
        </Group>
      ) : null}

      {!found && snap.billsThisMonth.length > 0 ? (
        <Group title="บิลเดือนนี้">
          <RecordList>
            {snap.billsThisMonth.map((b) => (
              <RecordRow
                key={b.id}
                flush
                title={b.title}
                value={<AmountText satang={b.amountSatang} />}
                tag={<SoftTag>{isoToThaiShort(b.dueOn)}</SoftTag>}
                actions={<ToggleAction action={toggleBill} id={b.id} name="paid" value="1" label="จ่าย" />}
              />
            ))}
          </RecordList>
        </Group>
      ) : null}

      {!found && snap.expiring.length > 0 ? (
        <Group title="คลังใกล้หมด">
          <RecordList>
            {snap.expiring.map((v) => (
              <RecordRow
                key={v.id}
                flush
                title={v.title}
                tag={<SoftTag tone="orange">{isoToThaiShort(v.expiresOn)}</SoftTag>}
                actions={
                  <Button asChild size="sm" variant="outline">
                    <Link href="/vault?filter=soon">เปิด</Link>
                  </Button>
                }
              />
            ))}
          </RecordList>
        </Group>
      ) : null}
    </AppShell>
  );
}

function Chip({ href, label, count, alert }: { href: string; label: string; count?: number; alert?: boolean }) {
  const text = typeof count === "number" ? `${label} ${count}` : label;
  return (
    <Button asChild size="sm" variant={alert || (count ?? 0) > 0 ? "orange" : "outline"}>
      <Link href={href}>{text}</Link>
    </Button>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <p className="text-title mb-3 text-base">{title}</p>
      {children}
    </section>
  );
}

function DoneForm({ id }: { id: string }) {
  return <ToggleAction action={toggleTask} id={id} name="done" value="1" label="เสร็จ" variant="default" />;
}
