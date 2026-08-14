import { AppShell } from "@/components/app-shell";
import { FileField } from "@/components/file-field";
import { FileLink } from "@/components/file-link";
import { ConfirmDelete } from "@/components/notebook/confirm-delete";
import { ComposerSheet } from "@/components/notebook/composer-sheet";
import { NotebookForm } from "@/components/notebook/notebook-form";
import { RecordRow } from "@/components/notebook/record-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/empty-state";
import { createCapture, deleteCapture, fileCapture, updateCapture } from "./actions";
import { listUnfiledCaptures } from "@/lib/data";
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
  const open = await listUnfiledCaptures(user.id);

  return (
    <AppShell title="จดด่วน">
      {env.r2Configured ? null : (
        <p className="text-caption mb-3 text-orange">ยังไม่ได้ตั้งค่า R2 — จดข้อความได้</p>
      )}
      <div className="mb-4">
        <ComposerSheet label="จด" title="โยนเข้า Inbox">
          <NotebookForm action={createCapture}>
            <Label htmlFor="note">ข้อความ</Label>
            <Textarea id="note" name="note" placeholder="ซื้อนม, นัดหมอ..." />
            <FileField />
            <Button type="submit">จด</Button>
          </NotebookForm>
        </ComposerSheet>
      </div>

      {open.length === 0 ? (
        <EmptyState title="Inbox ว่าง" hint="กดจดด้านบน แล้วค่อยจัดทีหลัง" />
      ) : (
        <ul className="grid gap-2">
          {open.map((row) => (
            <RecordRow
              key={row.id}
              title={row.note || "มีไฟล์แนบ"}
              hint={row.r2Key ? <FileLink r2Key={row.r2Key} /> : null}
              actions={
                <>
                  <ComposerSheet label="จัด" title="จัดรายการ" variant="outline" compact>
                    <div className="flex flex-wrap gap-2">
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
                    <NotebookForm action={fileCapture}>
                      <input type="hidden" name="id" value={row.id} />
                      <input type="hidden" name="kind" value="money" />
                      <Label htmlFor={`amount-${row.id}`}>เป็นรายจ่าย</Label>
                      <Input id={`amount-${row.id}`} name="amount" inputMode="decimal" required placeholder="บาท" />
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
                    </NotebookForm>
                    <NotebookForm action={updateCapture}>
                      <input type="hidden" name="id" value={row.id} />
                      <Textarea name="note" defaultValue={row.note} />
                      <Button type="submit" size="sm">
                        แก้โน้ต
                      </Button>
                    </NotebookForm>
                  </ComposerSheet>
                  <ConfirmDelete action={deleteCapture} id={row.id} />
                </>
              }
            />
          ))}
        </ul>
      )}
    </AppShell>
  );
}
