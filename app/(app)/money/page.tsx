import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { FileField } from "@/components/file-field";
import { FileLink } from "@/components/file-link";
import { AmountText } from "@/components/notebook/amount-text";
import { CategorySelect } from "@/components/notebook/category-select";
import { ConfirmDelete } from "@/components/notebook/confirm-delete";
import { ComposerSheet } from "@/components/notebook/composer-sheet";
import { NotebookForm } from "@/components/notebook/notebook-form";
import { OverviewCard } from "@/components/notebook/overview-card";
import { RecordRow, SoftTag } from "@/components/notebook/record-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <AppShell title="เงิน" subtitle="รายจ่ายและใบเสร็จ">
      <div className="mb-5 grid grid-cols-2 gap-3">
        <OverviewCard tone="kaffir" title="วันนี้" value={<AmountText satang={todayTotal} />} />
        <OverviewCard title="เดือนนี้" value={<AmountText satang={monthTotal} />} hint={`${rows.length} รายการ`} />
      </div>

      <div className="mb-5">
        <ComposerSheet label="จ่าย" title="รายจ่าย" variant="orange">
          <NotebookForm action={createExpense}>
            <Label htmlFor="amount">จำนวน (บาท)</Label>
            <Input id="amount" name="amount" inputMode="decimal" required placeholder="120" />
            <CategorySelect />
            <Input name="merchant" placeholder="ร้าน" />
            <Input name="spentOn" type="date" defaultValue={today} />
            <FileField label="ใบเสร็จ" />
            <Button type="submit" variant="orange">
              บันทึกรายจ่าย
            </Button>
          </NotebookForm>
        </ComposerSheet>
      </div>

      {monthTotal > 0 ? (
        <ul className="df-card mb-5 grid gap-2 p-3">
          {byCat
            .filter((c) => c.total > 0)
            .map((c) => (
              <li key={c.id} className="flex justify-between text-sm">
                <span className="text-ink-muted">{c.label}</span>
                <AmountText satang={c.total} className="font-semibold" />
              </li>
            ))}
        </ul>
      ) : null}

      {rows.length === 0 ? (
        <EmptyState title="ยังไม่มีรายจ่าย" hint="กดจ่ายด้านบน แล้วติดตามยอดวันนี้/เดือนนี้" />
      ) : (
        <ul className="grid gap-3">
          {rows.map((e) => (
            <RecordRow
              key={e.id}
              title={e.merchant || label(e.category)}
              value={<AmountText satang={e.amountSatang} />}
              tag={
                <>
                  <SoftTag tone="kaffir">{label(e.category)}</SoftTag>
                  <SoftTag>{isoToThaiShort(e.spentOn)}</SoftTag>
                </>
              }
              actions={
                <>
                  {e.receiptR2Key ? <FileLink r2Key={e.receiptR2Key} label="ใบเสร็จ" /> : null}
                  <ComposerSheet label="แก้" title="แก้รายจ่าย" variant="outline" compact>
                    <NotebookForm action={updateExpense}>
                      <input type="hidden" name="id" value={e.id} />
                      <Input name="amount" defaultValue={String(e.amountSatang / 100)} required />
                      <CategorySelect label={null} defaultValue={e.category} id={`cat-${e.id}`} />
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
