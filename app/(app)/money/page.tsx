import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { FileField } from "@/components/file-field";
import { FileLink } from "@/components/file-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { createExpense, deleteExpense } from "./actions";
import { listExpenses, monthExpenseTotal } from "@/lib/data";
import { expenseCategories } from "@/lib/modules";
import { requireUser } from "@/lib/session";
import { isoToThaiShort } from "@/lib/thai-date";
import { bahtFromSatang, bangkokTodayIso } from "@/lib/utils";

export default async function MoneyPage() {
  const user = await requireUser();
  const today = bangkokTodayIso();
  const rows = await listExpenses(user.id);
  const todayTotal = rows.filter((e) => e.spentOn === today).reduce((s, e) => s + e.amountSatang, 0);
  const monthTotal = await monthExpenseTotal(user.id, today);
  const label = (id: string) => expenseCategories.find((c) => c.id === id)?.label ?? id;

  return (
    <AppShell title="เงิน">
      <div className="mb-8 grid gap-3 md:grid-cols-12">
        <section className="rounded-xl bg-orange p-5 text-paper md:col-span-7">
          <p className="text-sm text-paper/80">วันนี้</p>
          <p className="font-display tabular mt-1 text-4xl">฿{bahtFromSatang(todayTotal)}</p>
        </section>
        <section className="rounded-xl border border-line bg-paper-2 p-5 md:col-span-5">
          <p className="text-sm text-ink-muted">เดือนนี้</p>
          <p className="font-display tabular mt-1 text-4xl">฿{bahtFromSatang(monthTotal)}</p>
        </section>
      </div>

      <form action={createExpense} className="mb-8 grid gap-3 rounded-xl border border-line p-4 md:max-w-xl">
        <div className="grid gap-1.5">
          <Label htmlFor="amount">จำนวน (บาท)</Label>
          <Input id="amount" name="amount" inputMode="decimal" required placeholder="120" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="category">หมวด</Label>
          <NativeSelect id="category" name="category" defaultValue="food">
            {expenseCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="merchant">ร้าน</Label>
          <Input id="merchant" name="merchant" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="spentOn">วันที่</Label>
          <Input id="spentOn" name="spentOn" type="date" defaultValue={today} />
        </div>
        <FileField label="ใบเสร็จ" />
        <Button type="submit" variant="orange">
          บันทึกรายจ่าย
        </Button>
      </form>

      {rows.length === 0 ? (
        <EmptyState title="ยังไม่มีรายจ่าย" hint="ถ่ายใบเสร็จหรือใส่จำนวนก็ได้" />
      ) : (
        <>
          <ul className="grid gap-3 lg:hidden">
            {rows.map((e) => (
              <li key={e.id} className="rounded-xl border border-line p-4">
                <p className="font-display tabular text-2xl">฿{bahtFromSatang(e.amountSatang)}</p>
                <p className="text-sm text-ink-muted">
                  {label(e.category)} · {e.merchant || "—"} · {isoToThaiShort(e.spentOn)}
                </p>
                {e.receiptR2Key ? <FileLink r2Key={e.receiptR2Key} label="ใบเสร็จ" /> : null}
                <form action={deleteExpense} className="mt-2">
                  <input type="hidden" name="id" value={e.id} />
                  <Button size="sm" variant="ghost">
                    ลบ
                  </Button>
                </form>
              </li>
            ))}
          </ul>
          <div className="hidden lg:block">
            <table className="w-full text-left">
              <thead className="border-b border-line text-sm text-ink-muted">
                <tr>
                  <th className="py-2">จำนวน</th>
                  <th>หมวด</th>
                  <th>ร้าน</th>
                  <th>วันที่</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((e) => (
                  <tr key={e.id} className="border-b border-line/70">
                    <td className="font-display tabular py-3">฿{bahtFromSatang(e.amountSatang)}</td>
                    <td>{label(e.category)}</td>
                    <td>{e.merchant}</td>
                    <td>{isoToThaiShort(e.spentOn)}</td>
                    <td>
                      {e.receiptR2Key ? <FileLink r2Key={e.receiptR2Key} /> : null}
                      <form action={deleteExpense} className="ml-2 inline">
                        <input type="hidden" name="id" value={e.id} />
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
