import { AppShell } from "@/components/app-shell";
import { FileField } from "@/components/file-field";
import { FileLink } from "@/components/file-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/empty-state";
import { createCapture, fileCapture } from "./actions";
import { listCaptures } from "@/lib/data";
import { expenseCategories } from "@/lib/modules";
import { requireUser } from "@/lib/session";
import { env } from "@/lib/env";

const destinations = [
  { kind: "task", label: "งาน" },
  { kind: "vault", label: "คลัง" },
  { kind: "home", label: "บ้าน" },
  { kind: "journal", label: "บันทึก" },
  { kind: "discard", label: "ทิ้ง" },
];

export default async function InboxPage() {
  const user = await requireUser();
  const rows = await listCaptures(user.id);
  const open = rows.filter((r) => r.kind === "unfiled");

  return (
    <AppShell title="จดด่วน">
      {!env.r2Configured ? (
        <p className="mb-4 text-sm text-orange">ยังไม่ได้ตั้งค่า R2 — จดข้อความได้ ไฟล์จะยังไม่อัปโหลด</p>
      ) : null}
      <form action={createCapture} className="mb-8 grid gap-3 rounded-xl border border-line bg-paper-2 p-4 md:max-w-xl">
        <Label htmlFor="note">โยนเข้า Inbox</Label>
        <Textarea id="note" name="note" placeholder="ซื้อนม, นัดหมอ, ถ่ายใบเสร็จ..." />
        <FileField />
        <Button type="submit">จด</Button>
      </form>

      {open.length === 0 ? (
        <EmptyState title="Inbox ว่าง" hint="จดอะไรก็ได้ตอนนี้ แล้วค่อยจัดทีหลัง" />
      ) : (
        <ul className="grid gap-3 md:max-w-2xl">
          {open.map((row) => (
            <li key={row.id} className="rounded-xl border border-line p-4">
              <p>{row.note || "มีไฟล์แนบ"}</p>
              {row.r2Key ? <FileLink r2Key={row.r2Key} /> : null}
              <div className="mt-3 flex flex-wrap gap-2">
                {destinations.map((d) => (
                  <form action={fileCapture} key={d.kind}>
                    <input type="hidden" name="id" value={row.id} />
                    <input type="hidden" name="kind" value={d.kind} />
                    <Button type="submit" size="sm" variant={d.kind === "discard" ? "orange" : "outline"}>
                      {d.label}
                    </Button>
                  </form>
                ))}
              </div>
              <form action={fileCapture} className="mt-3 grid gap-2 rounded-lg bg-paper-2 p-3">
                <input type="hidden" name="id" value={row.id} />
                <input type="hidden" name="kind" value="money" />
                <Label htmlFor={`amount-${row.id}`}>จัดเป็นรายจ่าย</Label>
                <Input id={`amount-${row.id}`} name="amount" inputMode="decimal" required placeholder="จำนวนบาท" />
                <NativeSelect name="category" defaultValue="food">
                  {expenseCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </NativeSelect>
                <Button type="submit" size="sm" variant="orange">
                  บันทึกเป็นเงิน
                </Button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
