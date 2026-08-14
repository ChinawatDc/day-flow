import { AppShell } from "@/components/app-shell";
import { FileField } from "@/components/file-field";
import { FileLink } from "@/components/file-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createBill,
  createHomeItem,
  createShopping,
  deleteBill,
  deleteHomeItem,
  deleteShopping,
  toggleBill,
  toggleShopping,
} from "./actions";
import { listHome } from "@/lib/data";
import { requireUser } from "@/lib/session";
import { isoToThaiShort } from "@/lib/thai-date";
import { bahtFromSatang } from "@/lib/utils";

export default async function HomePage() {
  const user = await requireUser();
  const { items, shopping, bills } = await listHome(user.id);

  return (
    <AppShell title="บ้าน">
      <div className="grid gap-10">
        <section>
          <h2 className="font-display text-2xl">ของในบ้าน</h2>
          <form action={createHomeItem} className="mt-4 grid gap-3 rounded-xl border border-line p-4 md:max-w-xl">
            <Input name="name" placeholder="ชื่อของ" required />
            <Input name="location" placeholder="ที่เก็บ" />
            <Input name="quantity" type="number" min={1} defaultValue={1} />
            <FileField />
            <Button type="submit">เพิ่มของ</Button>
          </form>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {items.map((it) => (
              <li key={it.id} className="rounded-xl border border-line p-4">
                <p className="font-display text-lg">{it.name}</p>
                <p className="text-sm text-ink-muted">
                  {it.location || "—"} · {it.quantity} ชิ้น
                </p>
                {it.r2Key ? <FileLink r2Key={it.r2Key} /> : null}
                <form action={deleteHomeItem} className="mt-2">
                  <input type="hidden" name="id" value={it.id} />
                  <Button size="sm" variant="ghost">
                    ลบ
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl">รายการซื้อ</h2>
          <form action={createShopping} className="mt-4 flex max-w-xl gap-2">
            <Input name="name" placeholder="ของที่จะซื้อ" required />
            <Button type="submit">เพิ่ม</Button>
          </form>
          <ul className="mt-4 grid gap-2 md:max-w-xl">
            {shopping.map((s) => (
              <li key={s.id} className="flex items-center justify-between rounded-lg border border-line px-3 py-2">
                <span className={s.bought ? "text-ink-muted line-through" : ""}>{s.name}</span>
                <div className="flex gap-2">
                  <form action={toggleShopping}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="bought" value={s.bought ? "0" : "1"} />
                    <Button size="sm" variant="outline">
                      {s.bought ? "ยังไม่ซื้อ" : "ซื้อแล้ว"}
                    </Button>
                  </form>
                  <form action={deleteShopping}>
                    <input type="hidden" name="id" value={s.id} />
                    <Button size="sm" variant="ghost">
                      ลบ
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl">บิลง่าย</h2>
          <form action={createBill} className="mt-4 grid gap-3 rounded-xl border border-line p-4 md:max-w-xl">
            <Label htmlFor="title">ชื่อบิล</Label>
            <Input id="title" name="title" required />
            <Input name="amount" placeholder="จำนวนบาท" />
            <Input name="dueOn" type="date" />
            <Button type="submit">เพิ่มบิล</Button>
          </form>
          <ul className="mt-4 grid gap-3 md:max-w-xl">
            {bills.map((b) => (
              <li key={b.id} className="rounded-xl border border-line p-4">
                <p className="font-display text-lg">{b.title}</p>
                <p className="text-sm text-ink-muted">
                  ฿{bahtFromSatang(b.amountSatang)} · {isoToThaiShort(b.dueOn)} · {b.paid ? "จ่ายแล้ว" : "ยังไม่จ่าย"}
                </p>
                <div className="mt-2 flex gap-2">
                  <form action={toggleBill}>
                    <input type="hidden" name="id" value={b.id} />
                    <input type="hidden" name="paid" value={b.paid ? "0" : "1"} />
                    <Button size="sm" variant="outline">
                      {b.paid ? "ยังไม่จ่าย" : "จ่ายแล้ว"}
                    </Button>
                  </form>
                  <form action={deleteBill}>
                    <input type="hidden" name="id" value={b.id} />
                    <Button size="sm" variant="ghost">
                      ลบ
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
