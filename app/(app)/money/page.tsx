import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { FileField } from "@/components/file-field";
import { FileLink } from "@/components/file-link";
import { AmountText } from "@/components/notebook/amount-text";
import { ConfirmDelete } from "@/components/notebook/confirm-delete";
import { EditPanel } from "@/components/notebook/edit-panel";
import { NotebookForm } from "@/components/notebook/notebook-form";
import { RecordRow } from "@/components/notebook/record-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { createExpense, deleteExpense, updateExpense } from "./actions";
import { listExpenses, monthExpenseTotal, monthExpensesByCategory } from "@/lib/data";
import { expenseCategories } from "@/lib/modules";
import { requireUser } from "@/lib/session";
import { isoToThaiShort } from "@/lib/thai-date";
import { bangkokTodayIso } from "@/lib/utils";

export default async function MoneyPage() {
  const user = await requireUser();
  const today = bangkokTodayIso();
  const rows = await listExpenses(user.id);
  const todayTotal = rows.filter((e) => e.spentOn === today).reduce((s, e) => s + e.amountSatang, 0);
  const monthTotal = await monthExpenseTotal(user.id, today);
  const byCat = await monthExpensesByCategory(user.id, today);
  const label = (id: string) => expenseCategories.find((c) => c.id === id)?.label ?? id;

  return (
    <AppShell title="เงิน">
      <div className="mb-8 grid gap-3 md:grid-cols-12">
        <section className="rounded-[var(--radius-card)] bg-orange p-5 text-paper md:col-span-7">
          <p className="text-sm text-paper/80">วันนี้</p>
          <p className="text-display mt-1 text-paper">
            <AmountText satang={todayTotal} className="text-paper" />
          </p>
        </section>
        <section className="rounded-[var(--radius-card)] border border-line bg-paper-2 p-5 md:col-span-5">
          <p className="text-caption">เดือนนี้</p>
          <p className="text-display mt-1">
            <AmountText satang={monthTotal} />
          </p>
        </section>
      </div>

      <ul className="mb-8 grid gap-2">
        {byCat.map((c) => (
          <li key={c.id} className="flex justify-between text-sm">
            <span>{c.label}</span>
            <AmountText satang={c.total} className="font-semibold" />
          </li>
        ))}
      </ul>

      <NotebookForm action={createExpense} className="bg-paper">
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
      </NotebookForm>

      {rows.length === 0 ? (
        <EmptyState title="ยังไม่มีรายจ่าย" hint="ถ่ายใบเสร็จหรือใส่จำนวนก็ได้" />
      ) : (
        <ul className="grid gap-3">
          {rows.map((e) => (
            <RecordRow
              key={e.id}
              title={e.merchant || label(e.category)}
              hint={`${label(e.category)} · ${isoToThaiShort(e.spentOn)}`}
              value={<AmountText satang={e.amountSatang} className="text-title" />}
              actions={
                <>
                  {e.receiptR2Key ? <FileLink r2Key={e.receiptR2Key} label="ใบเสร็จ" /> : null}
                  <EditPanel>
                    <form action={updateExpense} className="grid gap-2">
                      <input type="hidden" name="id" value={e.id} />
                      <Input name="amount" defaultValue={String(e.amountSatang / 100)} required />
                      <NativeSelect name="category" defaultValue={e.category}>
                        {expenseCategories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </NativeSelect>
                      <Input name="merchant" defaultValue={e.merchant} />
                      <Input name="spentOn" type="date" defaultValue={String(e.spentOn)} />
                      <FileField label="ใบเสร็จใหม่" />
                      <Button type="submit" size="sm">
                        บันทึก
                      </Button>
                    </form>
                  </EditPanel>
                  <ConfirmDelete action={deleteExpense} id={e.id} />
                </>
              }
            />
          ))}
        </ul>
      )}
    </AppShell>
  );
}
