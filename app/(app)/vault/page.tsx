import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
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
import { createVaultItem, deleteVaultItem, updateVaultItem } from "./actions";
import { FilterPills } from "@/components/notebook/filter-pills";
import { listVault } from "@/lib/data";
import { vaultKinds } from "@/lib/modules";
import { requireUser } from "@/lib/session";
import { isoToThaiShort } from "@/lib/thai-date";
import { addDaysIso, bangkokTodayIso } from "@/lib/utils";

export default async function VaultPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const user = await requireUser();
  const { filter } = await searchParams;
  const today = bangkokTodayIso();
  const soon = addDaysIso(today, 30);
  const all = await listVault(user.id, filter === "soon" ? { soonAfter: today, soonBefore: soon } : undefined);
  const label = (id: string) => vaultKinds.find((k) => k.id === id)?.label ?? id;

  return (
    <AppShell title="คลัง">
      <FilterPills
        items={[
          { href: "/vault", label: "ทั้งหมด", active: !filter },
          { href: "/vault?filter=soon", label: "ใกล้หมดอายุ", active: filter === "soon" },
        ]}
      />
      <div className="mb-4">
        <ComposerSheet label="เก็บเอกสาร" title="เอกสารใหม่">
          <NotebookForm action={createVaultItem}>
            <Label htmlFor="title">ชื่อเอกสาร</Label>
            <Input id="title" name="title" required />
            <Label htmlFor="kind">ประเภท</Label>
            <NativeSelect id="kind" name="kind">
              {vaultKinds.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.label}
                </option>
              ))}
            </NativeSelect>
            <Label htmlFor="expiresOn">วันหมดอายุ</Label>
            <Input id="expiresOn" name="expiresOn" type="date" />
            <FileField label="ไฟล์" />
            <Button type="submit">เก็บ</Button>
          </NotebookForm>
        </ComposerSheet>
      </div>
      {all.length === 0 ? (
        <EmptyState title="คลังว่าง" hint="เก็บบัตร ประกัน สัญญา ไว้ที่นี่" />
      ) : (
        <ul className="grid gap-2">
          {all.map((v) => (
            <RecordRow
              key={v.id}
              title={v.title}
              hint={`${label(v.kind)} · หมด ${isoToThaiShort(v.expiresOn) || "—"}`}
              actions={
                <>
                  {v.r2Key ? <FileLink r2Key={v.r2Key} /> : null}
                  <ComposerSheet label="แก้" title="แก้เอกสาร" variant="outline" compact>
                    <NotebookForm action={updateVaultItem}>
                      <input type="hidden" name="id" value={v.id} />
                      <Input name="title" defaultValue={v.title} required />
                      <NativeSelect name="kind" defaultValue={v.kind}>
                        {vaultKinds.map((k) => (
                          <option key={k.id} value={k.id}>
                            {k.label}
                          </option>
                        ))}
                      </NativeSelect>
                      <Input name="expiresOn" type="date" defaultValue={v.expiresOn ?? ""} />
                      <FileField label="ไฟล์ใหม่" />
                      <Button type="submit" size="sm">
                        บันทึก
                      </Button>
                    </NotebookForm>
                  </ComposerSheet>
                  <ConfirmDelete action={deleteVaultItem} id={v.id} />
                </>
              }
            />
          ))}
        </ul>
      )}
    </AppShell>
  );
}
