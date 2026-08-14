import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { AmountText } from "@/components/notebook/amount-text";
import { NotebookForm } from "@/components/notebook/notebook-form";
import { RecordRow } from "@/components/notebook/record-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { createExpense } from "@/app/(app)/money/actions";
import { toggleTask } from "@/app/(app)/tasks/actions";
import { copyLastMonthBills, toggleBill } from "@/app/(app)/home/actions";
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

  return (
    <AppShell title="วันนี้">
      <p className="text-caption mb-4">{isoToThaiDisplay(snap.today)}</p>

      <form action="/today" className="mb-6">
        <Label htmlFor="q" className="sr-only">
          ค้น
        </Label>
        <Input id="q" name="q" defaultValue={q} placeholder="ค้นงาน เงิน คลัง จด" />
      </form>

      {found ? (
        <section className="mb-8 grid gap-2">
          <p className="text-title">ผลค้น</p>
          {found.tasks.length + found.expenses.length + found.vault.length + found.captures.length === 0 ? (
            <p className="text-caption">ไม่พบ</p>
          ) : null}
          {found.tasks.map((t) => (
            <RecordRow key={t.id} title={t.title} hint="งาน" actions={<Link className="text-sm text-kaffir" href="/tasks">เปิดงาน</Link>} />
          ))}
          {found.expenses.map((e) => (
            <RecordRow
              key={e.id}
              title={e.merchant || "รายจ่าย"}
              hint="เงิน"
              value={<AmountText satang={e.amountSatang} />}
              actions={<Link className="text-sm text-kaffir" href="/money">เปิดเงิน</Link>}
            />
          ))}
          {found.vault.map((v) => (
            <RecordRow key={v.id} title={v.title} hint="คลัง" actions={<Link className="text-sm text-kaffir" href="/vault">เปิดคลัง</Link>} />
          ))}
          {found.captures.map((c) => (
            <RecordRow key={c.id} title={c.note || "จดด่วน"} hint="จด" actions={<Link className="text-sm text-kaffir" href="/inbox">จัดจด</Link>} />
          ))}
        </section>
      ) : null}

      <section className="mb-6 rounded-[var(--radius-card)] bg-kaffir p-5 text-paper">
        <p className="text-sm text-paper/80">ยอดจ่ายวันนี้</p>
        <p className="text-display mt-2 text-paper">
          <AmountText satang={snap.spentToday} className="text-paper" />
        </p>
      </section>

      <NotebookForm action={createExpense}>
        <p className="text-title">จดรายจ่าย</p>
        <div className="grid gap-1.5">
          <Label htmlFor="amount">จำนวนบาท</Label>
          <Input id="amount" name="amount" inputMode="decimal" required placeholder="120" />
        </div>
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

      <section className="mb-8">
        <p className="text-title mb-3">งานวันนี้</p>
        {snap.todayTasks.length === 0 ? (
          <p className="text-caption">ไม่มีงานวันนี้</p>
        ) : (
          <ul className="grid gap-3">
            {snap.todayTasks.map((t) => (
              <RecordRow
                key={t.id}
                title={t.title}
                hint={isoToThaiShort(t.dueOn)}
                actions={
                  <form action={toggleTask}>
                    <input type="hidden" name="id" value={t.id} />
                    <input type="hidden" name="done" value="1" />
                    <Button size="sm">เสร็จ</Button>
                  </form>
                }
              />
            ))}
          </ul>
        )}
      </section>

      <section className="mb-8">
        <p className="text-title mb-3">งานค้างข้ามวัน</p>
        {snap.overdueTasks.length === 0 ? (
          <p className="text-caption">ไม่มีค้าง</p>
        ) : (
          <ul className="grid gap-3">
            {snap.overdueTasks.map((t) => (
              <RecordRow
                key={t.id}
                title={t.title}
                hint={isoToThaiShort(t.dueOn)}
                actions={
                  <form action={toggleTask}>
                    <input type="hidden" name="id" value={t.id} />
                    <input type="hidden" name="done" value="1" />
                    <Button size="sm">เสร็จ</Button>
                  </form>
                }
              />
            ))}
          </ul>
        )}
      </section>

      <section className="mb-8">
        <div className="mb-3 flex items-baseline justify-between">
          <p className="text-title">จดด่วนค้าง</p>
          <Link href="/inbox" className="text-sm text-kaffir">
            จัดทั้งหมด
          </Link>
        </div>
        <p className="text-numeric mb-2">{snap.unfiledCount}</p>
        {snap.staleInbox.length > 0 ? (
          <p className="text-caption mb-2 text-orange">ค้างเกิน 3 วัน {snap.staleInbox.length} รายการ</p>
        ) : null}
      </section>

      <section className="mb-8">
        <div className="mb-3 flex items-baseline justify-between">
          <p className="text-title">บิลเดือนนี้</p>
          <form action={copyLastMonthBills}>
            <Button size="sm" variant="outline">
              คัดลอกบิลเดือนที่แล้ว
            </Button>
          </form>
        </div>
        {snap.billsThisMonth.length === 0 ? (
          <p className="text-caption">ไม่มีบิลค้างเดือนนี้</p>
        ) : (
          <ul className="grid gap-3">
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
                      จ่ายแล้ว
                    </Button>
                  </form>
                }
              />
            ))}
          </ul>
        )}
      </section>

      <section className="mb-8">
        <p className="text-title mb-3">คลังใกล้หมดอายุ</p>
        {snap.expiring.length === 0 ? (
          <p className="text-caption">ไม่มีใน 30 วัน</p>
        ) : (
          <ul className="grid gap-3">
            {snap.expiring.map((v) => (
              <RecordRow
                key={v.id}
                title={v.title}
                hint={isoToThaiShort(v.expiresOn)}
                actions={
                  <Link className="text-sm text-kaffir" href="/vault?filter=soon">
                    เปิดคลัง
                  </Link>
                }
              />
            ))}
          </ul>
        )}
      </section>

      <p className="text-caption">
        บันทึกวันนี้: {snap.hasJournal ? "เขียนแล้ว" : "ยังไม่เขียน"} ·{" "}
        <Link href="/journal" className="text-kaffir">
          เปิดบันทึก
        </Link>
      </p>
    </AppShell>
  );
}
