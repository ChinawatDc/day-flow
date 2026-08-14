import { Package, ShoppingCart, Receipt } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { FileField } from "@/components/file-field";
import { FileLink } from "@/components/file-link";
import { AmountText } from "@/components/notebook/amount-text";
import { ChapterTabs } from "@/components/notebook/chapter-tabs";
import { ConfirmDelete } from "@/components/notebook/confirm-delete";
import { ComposerSheet } from "@/components/notebook/composer-sheet";
import { NotebookForm } from "@/components/notebook/notebook-form";
import { RecordRow } from "@/components/notebook/record-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  copyLastMonthBills,
  createBill,
  createHomeItem,
  createShopping,
  deleteBill,
  deleteHomeItem,
  deleteShopping,
  toggleBill,
  toggleShopping,
  updateBill,
  updateHomeItem,
} from "./actions";
import { listHome } from "@/lib/data";
import { requireUser } from "@/lib/session";
import { isoToThaiShort } from "@/lib/thai-date";

export default async function HomePage() {
  const user = await requireUser();
  const { items, shopping, bills } = await listHome(user.id);
  const openShop = shopping.filter((s) => !s.bought).length;
  const unpaid = bills.filter((b) => !b.paid).length;

  return (
    <AppShell title="บ้าน">
      <div className="mb-5 grid grid-cols-3 gap-2">
        <Stat tip="ของในบ้าน" value={String(items.length)} icon={<Package className="size-4" />} />
        <Stat tip="รอซื้อ" value={String(openShop)} icon={<ShoppingCart className="size-4" />} />
        <Stat tip="บิลค้าง" value={String(unpaid)} icon={<Receipt className="size-4" />} />
      </div>

      <ChapterTabs labels={["ของ", "ซื้อ", "บิล"]}>
        <div>
          <div className="mb-4">
            <ComposerSheet label="เพิ่มของในบ้าน" title="ของใหม่">
              <NotebookForm action={createHomeItem}>
                <Label htmlFor="name">ชื่อ</Label>
                <Input id="name" name="name" placeholder="เช่น ไฟฉาย" required />
                <Label htmlFor="location">ที่เก็บ</Label>
                <Input id="location" name="location" placeholder="ตู้ครัว / ห้องเก็บ" />
                <Label htmlFor="quantity">จำนวน</Label>
                <Input id="quantity" name="quantity" type="number" min={1} defaultValue={1} />
                <FileField label="รูป" />
                <Button type="submit">เพิ่มของ</Button>
              </NotebookForm>
            </ComposerSheet>
          </div>
          {items.length === 0 ? (
            <EmptyState title="บ้านยังว่าง" hint="เพิ่มของที่ใช้ประจำ ให้รู้ว่าอยู่ไหน กี่ชิ้น" />
          ) : (
            <ul className="grid gap-2.5">
              {items.map((it) => (
                <li
                  key={it.id}
                  className="rounded-2xl border border-line bg-gradient-to-br from-paper to-paper-2 p-3.5 shadow-[0_8px_24px_rgba(28,25,23,0.04)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold">{it.name}</p>
                      <p className="text-caption mt-0.5">
                        {it.location || "ไม่ระบุที่"} · {it.quantity} ชิ้น
                      </p>
                    </div>
                    <span className="rounded-full bg-kaffir/10 px-2.5 py-1 text-xs font-semibold text-kaffir">
                      ×{it.quantity}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {it.r2Key ? <FileLink r2Key={it.r2Key} label="ดูรูป" /> : null}
                    <ComposerSheet label="แก้" title="แก้ของ" variant="outline" compact>
                      <NotebookForm action={updateHomeItem}>
                        <input type="hidden" name="id" value={it.id} />
                        <Input name="name" defaultValue={it.name} required />
                        <Input name="location" defaultValue={it.location} />
                        <Input name="quantity" type="number" defaultValue={it.quantity} />
                        <FileField label="รูปใหม่" />
                        <Button type="submit" size="sm">
                          บันทึก
                        </Button>
                      </NotebookForm>
                    </ComposerSheet>
                    <ConfirmDelete action={deleteHomeItem} id={it.id} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <form action={createShopping} className="mb-4 flex gap-2 rounded-2xl border border-line bg-paper-2 p-2">
            <Input
              name="name"
              placeholder="จะซื้ออะไร…"
              required
              className="border-0 bg-transparent shadow-none focus:ring-0"
            />
            <Button type="submit" className="shrink-0 rounded-xl">
              เพิ่ม
            </Button>
          </form>
          {shopping.length === 0 ? (
            <EmptyState title="รายการซื้อว่าง" hint="พิมพ์ของที่จะซื้อด้านบน ติ๊กเมื่อซื้อแล้ว" />
          ) : (
            <ul className="grid gap-2">
              {shopping.map((s) => (
                <RecordRow
                  key={s.id}
                  title={s.name}
                  done={s.bought}
                  actions={
                    <>
                      <form action={toggleShopping}>
                        <input type="hidden" name="id" value={s.id} />
                        <input type="hidden" name="bought" value={s.bought ? "0" : "1"} />
                        <Button size="sm" variant={s.bought ? "outline" : "default"}>
                          {s.bought ? "ยัง" : "ซื้อแล้ว"}
                        </Button>
                      </form>
                      <ConfirmDelete action={deleteShopping} id={s.id} />
                    </>
                  }
                />
              ))}
            </ul>
          )}
        </div>

        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <form action={copyLastMonthBills}>
              <Button type="submit" variant="outline" size="sm">
                คัดลอกเดือนที่แล้ว
              </Button>
            </form>
          </div>
          <div className="mb-4">
            <ComposerSheet label="เพิ่มบิล" title="บิลใหม่">
              <NotebookForm action={createBill}>
                <Label htmlFor="title">ชื่อบิล</Label>
                <Input id="title" name="title" required placeholder="ค่าน้ำ / ค่าไฟ" />
                <Label htmlFor="amount">จำนวน (บาท)</Label>
                <Input id="amount" name="amount" placeholder="เช่น 450" inputMode="decimal" />
                <Label htmlFor="dueOn">ครบกำหนด</Label>
                <Input id="dueOn" name="dueOn" type="date" />
                <Button type="submit">เพิ่มบิล</Button>
              </NotebookForm>
            </ComposerSheet>
          </div>
          {bills.length === 0 ? (
            <EmptyState title="ยังไม่มีบิล" hint="เพิ่มบิลเดือนนี้ หรือคัดลอกจากเดือนที่แล้ว" />
          ) : (
            <ul className="grid gap-2.5">
              {bills.map((b) => (
                <li
                  key={b.id}
                  className={`rounded-2xl border p-3.5 ${
                    b.paid ? "border-line bg-paper-2/70" : "border-orange/30 bg-orange-soft/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className={`truncate font-semibold ${b.paid ? "text-ink-muted line-through" : ""}`}>
                        {b.title}
                      </p>
                      <p className="text-caption mt-0.5">
                        {isoToThaiShort(b.dueOn) || "ไม่กำหนด"} · {b.paid ? "จ่ายแล้ว" : "ยังไม่จ่าย"}
                      </p>
                    </div>
                    <AmountText satang={b.amountSatang} className="text-base font-bold" />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <form action={toggleBill}>
                      <input type="hidden" name="id" value={b.id} />
                      <input type="hidden" name="paid" value={b.paid ? "0" : "1"} />
                      <Button size="sm" variant={b.paid ? "outline" : "orange"}>
                        {b.paid ? "ยังไม่จ่าย" : "จ่ายแล้ว"}
                      </Button>
                    </form>
                    <ComposerSheet label="แก้" title="แก้บิล" variant="outline" compact>
                      <NotebookForm action={updateBill}>
                        <input type="hidden" name="id" value={b.id} />
                        <Input name="title" defaultValue={b.title} required />
                        <Input name="amount" defaultValue={String(b.amountSatang / 100)} />
                        <Input name="dueOn" type="date" defaultValue={b.dueOn ?? ""} />
                        <Button type="submit" size="sm">
                          บันทึก
                        </Button>
                      </NotebookForm>
                    </ComposerSheet>
                    <ConfirmDelete action={deleteBill} id={b.id} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </ChapterTabs>
    </AppShell>
  );
}

function Stat({ tip, value, icon }: { tip: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-paper-2 px-3 py-3">
      <div className="mb-1 text-kaffir">{icon}</div>
      <p className="text-display text-[1.6rem] leading-none">{value}</p>
      <p className="text-caption mt-1">{tip}</p>
    </div>
  );
}
