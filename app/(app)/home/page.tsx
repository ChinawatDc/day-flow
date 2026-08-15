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
import { OverviewCard } from "@/components/notebook/overview-card";
import { RecordRow, SoftTag } from "@/components/notebook/record-row";
import { ToggleAction } from "@/components/notebook/toggle-action";
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
        <OverviewCard title="ของ" value={String(items.length)} />
        <OverviewCard title="รอซื้อ" value={String(openShop)} />
        <OverviewCard title="บิลค้าง" value={String(unpaid)} />
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
            <EmptyState title="บ้านยังว่าง" />
          ) : (
            <ul className="grid gap-3">
              {items.map((it) => (
                <RecordRow
                  key={it.id}
                  title={it.name}
                  hint={it.location || "ไม่ระบุที่"}
                  tag={<SoftTag tone="kaffir">×{it.quantity}</SoftTag>}
                  leading={<Package className="size-5 text-kaffir" />}
                  actions={
                    <>
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
                    </>
                  }
                />
              ))}
            </ul>
          )}
        </div>

        <div>
          <form action={createShopping} className="df-card mb-4 flex gap-2 p-2">
            <Input
              name="name"
              placeholder="จะซื้ออะไร…"
              required
              className="border-0 bg-transparent shadow-none focus:shadow-none"
            />
            <Button type="submit" className="shrink-0">
              เพิ่ม
            </Button>
          </form>
          {shopping.length === 0 ? (
            <EmptyState title="รายการซื้อว่าง" />
          ) : (
            <ul className="grid gap-3">
              {shopping.map((s) => (
                <RecordRow
                  key={s.id}
                  title={s.name}
                  done={s.bought}
                  leading={<ShoppingCart className="size-5 text-kaffir" />}
                  tag={s.bought ? <SoftTag>ซื้อแล้ว</SoftTag> : <SoftTag tone="orange">รอซื้อ</SoftTag>}
                  actions={
                    <>
                      <ToggleAction
                        action={toggleShopping}
                        id={s.id}
                        name="bought"
                        value={s.bought ? "0" : "1"}
                        label={s.bought ? "ยัง" : "ซื้อแล้ว"}
                        variant={s.bought ? "outline" : "default"}
                      />
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
            <EmptyState title="ยังไม่มีบิล" />
          ) : (
            <ul className="grid gap-3">
              {bills.map((b) => (
                <RecordRow
                  key={b.id}
                  title={b.title}
                  done={b.paid}
                  value={<AmountText satang={b.amountSatang} />}
                  leading={<Receipt className="size-5 text-kaffir" />}
                  tag={
                    <>
                      <SoftTag tone={b.paid ? "muted" : "orange"}>
                        {b.paid ? "จ่ายแล้ว" : "ยังไม่จ่าย"}
                      </SoftTag>
                      <SoftTag>{isoToThaiShort(b.dueOn) || "ไม่กำหนด"}</SoftTag>
                    </>
                  }
                  actions={
                    <>
                      <ToggleAction
                        action={toggleBill}
                        id={b.id}
                        name="paid"
                        value={b.paid ? "0" : "1"}
                        label={b.paid ? "ยังไม่จ่าย" : "จ่ายแล้ว"}
                        variant={b.paid ? "outline" : "orange"}
                      />
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
                    </>
                  }
                />
              ))}
            </ul>
          )}
        </div>
      </ChapterTabs>
    </AppShell>
  );
}
