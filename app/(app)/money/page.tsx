import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { FileField } from "@/components/file-field";
import { FileLink } from "@/components/file-link";
import { AmountText } from "@/components/notebook/amount-text";
import { ConfirmDelete } from "@/components/notebook/confirm-delete";
import { ComposerSheet } from "@/components/notebook/composer-sheet";
import { NotebookForm } from "@/components/notebook/notebook-form";
import { RecordRow } from "@/components/notebook/record-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { createExpense, deleteExpense, updateExpense } from "./actions";
import { listExpenses, monthSummaryFromRows } from "@/lib/data";
import { expenseCategories } from "@/lib/modules";
import { requireUser } from "@/lib/session";
import { isoToThaiShort } from "@/lib/thai-date";
import { bangkokTodayIso } from "@/lib/utils";

export default async function MoneyPage() {
  const user = await requireUser();
  const today = bangkokTodayIso();
  const rows = await listExpenses(user.id);
  const byCat = monthSummaryFromRows(rows, today);
  const monthTotal = byCat.reduce((s, c) => s + c.total, 0);
  const todayTotal = rows.filter((e) => e.spentOn === today).reduce((s, e) => s + e.amountSatang, 0);
  const label = (id: string) => expenseCategories.find((c) => c.id === id)?.label ?? id;

  return (
    <AppShell title="เงิน">
      <div className="mb-4">
        <p className="text-caption">วันนี้ / เดือนนี้</p>
        <p className="text-display mt-1">
          <AmountText satang={todayTotal} />
          <span className="text-caption mx-2">·</span>
          <span className="text-title">
            <AmountText satang={monthTotal} />
          </span>
        </p>
        <div className="mt-3">
          <ComposerSheet label="จ่าย" title="รายจ่าย" variant="orange">
            <NotebookForm action={createExpense}>
              <Label htmlFor="amount">จำนวน (บาท)</Label>
              <Input id="amount" name="amount" inputMode="decimal" required placeholder="120" />
              <Label htmlFor="category">หมวด</Label>
              <NativeSelect id="category" name="category" defaultValue="food">
                {expenseCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </NativeSelect>
              <Input name="merchant" placeholder="ร้าน" />
              <Input name="spentOn" type="date" defaultValue={today} />
              <FileField label="ใบเสร็จ" />
              <Button type="submit" variant="orange">
                บันทึกรายจ่าย
              </Button>
            </NotebookForm>
          </ComposerSheet>
        </div>
      </div>
      {monthTotal > 0 ? (
        <ul className="mb-5 grid gap-1">
          {byCat
            .filter((c) => c.total > 0)
            .map((c) => (
              <li key={c.id} className="flex justify-between text-sm">
                <span>{c.label}</span>
                <AmountText satang={c.total} className="font-semibold" />
              </li>
            ))}
        </ul>
      ) : null}
      {rows.length === 0 ? (
        <EmptyState title="ยังไม่มีรายจ่าย" hint="กดจ่ายด้านบน" />
      ) : (
        <ul className="grid gap-2">
          {rows.map((e) => (
            <RecordRow
              key={e.id}
              title={e.merchant || label(e.category)}
              hint={`${label(e.category)} · ${isoToThaiShort(e.spentOn)}`}
              value={<AmountText satang={e.amountSatang} />}
              actions={
                <>
                  {e.receiptR2Key ? <FileLink r2Key={e.receiptR2Key} label="ใบเสร็จ" /> : null}
                  <ComposerSheet label="แก้" title="แก้รายจ่าย" variant="outline" compact>
                    <NotebookForm action={updateExpense}>
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
                    </NotebookForm>
                  </ComposerSheet>
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
