import { AppShell } from "@/components/app-shell";
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
      <div className="grid gap-10">
        <section>
          <h2 className="text-title">ของในบ้าน</h2>
          <NotebookForm action={createHomeItem} className="mt-4">
            <Input name="name" placeholder="ชื่อของ" required />
            <Input name="location" placeholder="ที่เก็บ" />
            <Input name="quantity" type="number" min={1} defaultValue={1} />
            <FileField />
            <Button type="submit">เพิ่มของ</Button>
          </NotebookForm>
          <ul className="mt-4 grid gap-3">
            {items.map((it) => (
              <RecordRow
                key={it.id}
                title={it.name}
                hint={`${it.location || "—"} · ${it.quantity} ชิ้น`}
                actions={
                  <>
                    {it.r2Key ? <FileLink r2Key={it.r2Key} /> : null}
                    <EditPanel>
                      <form action={updateHomeItem} className="grid gap-2">
                        <input type="hidden" name="id" value={it.id} />
                        <Input name="name" defaultValue={it.name} required />
                        <Input name="location" defaultValue={it.location} />
                        <Input name="quantity" type="number" defaultValue={it.quantity} />
                        <FileField label="รูปใหม่" />
                        <Button type="submit" size="sm">
                          บันทึก
                        </Button>
                      </form>
                    </EditPanel>
                    <ConfirmDelete action={deleteHomeItem} id={it.id} />
                  </>
                }
              />
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-title">รายการซื้อ</h2>
          <form action={createShopping} className="mt-4 flex max-w-xl gap-2">
            <Input name="name" placeholder="ของที่จะซื้อ" required />
            <Button type="submit">เพิ่ม</Button>
          </form>
          <ul className="mt-4 grid gap-3 md:max-w-xl">
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
                        {s.bought ? "ยังไม่ซื้อ" : "ซื้อแล้ว"}
                      </Button>
                    </form>
                    <ConfirmDelete action={deleteShopping} id={s.id} />
                  </>
                }
              />
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-title">บิลง่าย</h2>
          <form action={copyLastMonthBills} className="mt-3">
            <Button type="submit" variant="outline" size="sm">
              คัดลอกบิลเดือนที่แล้ว
            </Button>
          </form>
          <NotebookForm action={createBill} className="mt-4">
            <Label htmlFor="title">ชื่อบิล</Label>
            <Input id="title" name="title" required />
            <Input name="amount" placeholder="จำนวนบาท" />
            <Input name="dueOn" type="date" />
            <Button type="submit">เพิ่มบิล</Button>
          </NotebookForm>
          <ul className="mt-4 grid gap-3">
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
                        {b.paid ? "ยังไม่จ่าย" : "จ่ายแล้ว"}
                      </Button>
                    </form>
                    <EditPanel>
                      <form action={updateBill} className="grid gap-2">
                        <input type="hidden" name="id" value={b.id} />
                        <Input name="title" defaultValue={b.title} required />
                        <Input name="amount" defaultValue={String(b.amountSatang / 100)} />
                        <Input name="dueOn" type="date" defaultValue={b.dueOn ?? ""} />
                        <Button type="submit" size="sm">
                          บันทึก
                        </Button>
                      </form>
                    </EditPanel>
                    <ConfirmDelete action={deleteBill} id={b.id} />
                  </>
                }
              />
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
