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

  return (
    <AppShell title="บ้าน">
      <ChapterTabs labels={["ของ", "ซื้อ", "บิล"]}>
              <div>
                <div className="mb-4">
                  <ComposerSheet label="เพิ่มของ" title="ของในบ้าน">
                    <NotebookForm action={createHomeItem}>
                      <Input name="name" placeholder="ชื่อของ" required />
                      <Input name="location" placeholder="ที่เก็บ" />
                      <Input name="quantity" type="number" min={1} defaultValue={1} />
                      <FileField />
                      <Button type="submit">เพิ่มของ</Button>
                    </NotebookForm>
                  </ComposerSheet>
                </div>
                <ul className="grid gap-2">
                  {items.length === 0 ? (
                    <li>
                      <EmptyState title="ยังไม่มีของ" hint="กดเพิ่มของด้านบน" />
                    </li>
                  ) : null}
                  {items.map((it) => (
                    <RecordRow
                      key={it.id}
                      title={it.name}
                      hint={`${it.location || "—"} · ${it.quantity} ชิ้น`}
                      actions={
                        <>
                          {it.r2Key ? <FileLink r2Key={it.r2Key} /> : null}
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
              </div>
              <div>
                <form action={createShopping} className="mb-4 flex gap-2">
                  <Input name="name" placeholder="ของที่จะซื้อ" required />
                  <Button type="submit">เพิ่ม</Button>
                </form>
                <ul className="grid gap-2">
                  {shopping.length === 0 ? (
                    <li>
                      <EmptyState title="ยังไม่มีรายการซื้อ" hint="พิมพ์ของที่จะซื้อด้านบน" />
                    </li>
                  ) : null}
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
                            <Button size="sm" variant="outline">
                              {s.bought ? "ยัง" : "ซื้อแล้ว"}
                            </Button>
                          </form>
                          <ConfirmDelete action={deleteShopping} id={s.id} />
                        </>
                      }
                    />
                  ))}
                </ul>
              </div>
              <div>
                <div className="mb-3 flex gap-2">
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
                      <Input id="title" name="title" required />
                      <Input name="amount" placeholder="จำนวนบาท" />
                      <Input name="dueOn" type="date" />
                      <Button type="submit">เพิ่มบิล</Button>
                    </NotebookForm>
                  </ComposerSheet>
                </div>
                <ul className="grid gap-2">
                  {bills.length === 0 ? (
                    <li>
                      <EmptyState title="ยังไม่มีบิล" hint="กดเพิ่มบิลด้านบน" />
                    </li>
                  ) : null}
                  {bills.map((b) => (
                    <RecordRow
                      key={b.id}
                      title={b.title}
                      hint={`${isoToThaiShort(b.dueOn)} · ${b.paid ? "จ่ายแล้ว" : "ยังไม่จ่าย"}`}
                      value={<AmountText satang={b.amountSatang} />}
                      done={b.paid}
                      actions={
                        <>
                          <form action={toggleBill}>
                            <input type="hidden" name="id" value={b.id} />
                            <input type="hidden" name="paid" value={b.paid ? "0" : "1"} />
                            <Button size="sm" variant="outline">
                              {b.paid ? "ยัง" : "จ่าย"}
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
                        </>
                      }
                    />
                  ))}
                </ul>
              </div>
      </ChapterTabs>
    </AppShell>
  );
}
