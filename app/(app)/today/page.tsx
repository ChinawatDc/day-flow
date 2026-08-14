import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { AmountText } from "@/components/notebook/amount-text";
import { ComposerSheet } from "@/components/notebook/composer-sheet";
import { NotebookForm } from "@/components/notebook/notebook-form";
import { RecordRow } from "@/components/notebook/record-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { createExpense } from "@/app/(app)/money/actions";
import { toggleTask } from "@/app/(app)/tasks/actions";
import { toggleBill } from "@/app/(app)/home/actions";
import { getTodaySnapshot, searchNotebook } from "@/lib/data";
import { expenseCategories } from "@/lib/modules";
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
  const snap = await getTodaySnapshot(user.id);
  const found = q.trim() ? await searchNotebook(user.id, q) : null;
  const hasWork =
    snap.todayTasks.length +
      snap.overdueTasks.length +
      snap.billsThisMonth.length +
      snap.expiring.length >
    0;

  return (
    <AppShell title="วันนี้">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-caption">{isoToThaiDisplay(snap.today)}</p>
          <p className="text-display mt-1">
            <AmountText satang={snap.spentToday} />
          </p>
        </div>
        <ComposerSheet label="จ่าย" title="จดรายจ่าย" variant="orange" compact>
          <NotebookForm action={createExpense}>
            <Label htmlFor="amount">จำนวนบาท</Label>
            <Input id="amount" name="amount" inputMode="decimal" required placeholder="120" />
            <NativeSelect name="category" defaultValue="food">
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </NativeSelect>
            <Input name="merchant" placeholder="ร้าน" />
            <input type="hidden" name="spentOn" value={bangkokTodayIso()} />
            <Button type="submit" variant="orange">
              บันทึกจ่าย
            </Button>
          </NotebookForm>
        </ComposerSheet>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <Chip href="/inbox" label="จด" count={snap.unfiledCount} alert={snap.staleCount > 0} />
        <Chip href="/journal" label={snap.hasJournal ? "บันทึกแล้ว" : "บันทึก"} />
      </div>

      <form action="/today" className="mb-5">
        <Input id="q" name="q" defaultValue={q} placeholder="ค้นงาน เงิน คลัง จด" />
      </form>

      {found ? (
        <section className="mb-6">
          <p className="text-title mb-2">ผลค้น</p>
          {found.tasks.length + found.expenses.length + found.vault.length + found.captures.length === 0 ? (
            <p className="text-caption">ไม่พบ</p>
          ) : (
            <ul className="grid gap-2">
              {found.tasks.map((t) => (
                <RecordRow
                  key={t.id}
                  title={t.title}
                  hint="งาน"
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
                  title={e.merchant || "รายจ่าย"}
                  hint="เงิน"
                  value={<AmountText satang={e.amountSatang} />}
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
                  title={v.title}
                  hint="คลัง"
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
                  title={c.note || "จดด่วน"}
                  hint="จด"
                  actions={
                    <Button asChild size="sm" variant="outline">
                      <Link href="/inbox">เปิด</Link>
                    </Button>
                  }
                />
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {!found && !hasWork ? (
        <EmptyState title="วันนี้โล่ง" hint="ยังไม่มีงาน บิล หรือเอกสารใกล้หมด">
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
          <ul className="grid gap-2">
            {snap.overdueTasks.map((t) => (
              <RecordRow
                key={t.id}
                title={t.title}
                hint={isoToThaiShort(t.dueOn)}
                actions={<DoneForm id={t.id} />}
              />
            ))}
          </ul>
        </Group>
      ) : null}

      {!found && snap.todayTasks.length > 0 ? (
        <Group title="งานวันนี้">
          <ul className="grid gap-2">
            {snap.todayTasks.map((t) => (
              <RecordRow
                key={t.id}
                title={t.title}
                hint={isoToThaiShort(t.dueOn)}
                actions={<DoneForm id={t.id} />}
              />
            ))}
          </ul>
        </Group>
      ) : null}

      {!found && snap.billsThisMonth.length > 0 ? (
        <Group title="บิลเดือนนี้">
          <ul className="grid gap-2">
            {snap.billsThisMonth.map((b) => (
              <RecordRow
                key={b.id}
                title={b.title}
                hint={isoToThaiShort(b.dueOn)}
                value={<AmountText satang={b.amountSatang} />}
                actions={
                  <form action={toggleBill}>
                    <input type="hidden" name="id" value={b.id} />
                    <input type="hidden" name="paid" value="1" />
                    <Button size="sm" variant="outline">
                      จ่าย
                    </Button>
                  </form>
                }
              />
            ))}
          </ul>
        </Group>
      ) : null}

      {!found && snap.expiring.length > 0 ? (
        <Group title="คลังใกล้หมด">
          <ul className="grid gap-2">
            {snap.expiring.map((v) => (
              <RecordRow
                key={v.id}
                title={v.title}
                hint={isoToThaiShort(v.expiresOn)}
                actions={
                  <Button asChild size="sm" variant="outline">
                    <Link href="/vault?filter=soon">เปิด</Link>
                  </Button>
                }
              />
            ))}
          </ul>
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
      <p className="text-title mb-2">{title}</p>
      {children}
    </section>
  );
}

function DoneForm({ id }: { id: string }) {
  return (
    <form action={toggleTask}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="done" value="1" />
      <Button size="sm">เสร็จ</Button>
    </form>
  );
}
