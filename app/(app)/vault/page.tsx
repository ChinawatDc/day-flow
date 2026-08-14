import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { FileField } from "@/components/file-field";
import { FileLink } from "@/components/file-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { createVaultItem, deleteVaultItem } from "./actions";
import { listVault } from "@/lib/data";
import { vaultKinds } from "@/lib/modules";
import { requireUser } from "@/lib/session";
import { isoToThaiShort } from "@/lib/thai-date";

export default async function VaultPage() {
  const user = await requireUser();
  const rows = await listVault(user.id);
  const label = (id: string) => vaultKinds.find((k) => k.id === id)?.label ?? id;

  return (
    <AppShell title="คลัง">
      <form action={createVaultItem} className="mb-8 grid gap-3 rounded-xl border border-line bg-paper-2 p-4 md:max-w-xl">
        <div className="grid gap-1.5">
          <Label htmlFor="title">ชื่อเอกสาร</Label>
          <Input id="title" name="title" required />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="kind">ประเภท</Label>
          <NativeSelect id="kind" name="kind">
            {vaultKinds.map((k) => (
              <option key={k.id} value={k.id}>
                {k.label}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="expiresOn">วันหมดอายุ</Label>
          <Input id="expiresOn" name="expiresOn" type="date" />
        </div>
        <FileField label="ไฟล์" />
        <Button type="submit">เก็บ</Button>
      </form>

      {rows.length === 0 ? (
        <EmptyState title="คลังว่าง" hint="เก็บบัตร ประกัน สัญญา ไว้ที่นี่" />
      ) : (
        <>
          <ul className="grid gap-3 lg:hidden">
            {rows.map((v) => (
              <li key={v.id} className="rounded-xl border border-line p-4">
                <p className="font-display text-xl">{v.title}</p>
                <p className="text-sm text-ink-muted">
                  {label(v.kind)} · หมด {isoToThaiShort(v.expiresOn) || "—"}
                </p>
                {v.r2Key ? <FileLink r2Key={v.r2Key} /> : null}
                <form action={deleteVaultItem} className="mt-2">
                  <input type="hidden" name="id" value={v.id} />
                  <Button size="sm" variant="ghost">
                    ลบ
                  </Button>
                </form>
              </li>
            ))}
          </ul>
          <div className="hidden lg:block">
            <table className="w-full text-left">
              <thead className="border-b border-line text-sm text-ink-muted">
                <tr>
                  <th className="py-2">ชื่อ</th>
                  <th>ประเภท</th>
                  <th>หมดอายุ</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((v) => (
                  <tr key={v.id} className="border-b border-line/70">
                    <td className="py-3">{v.title}</td>
                    <td>{label(v.kind)}</td>
                    <td>{isoToThaiShort(v.expiresOn)}</td>
                    <td>{v.r2Key ? <FileLink r2Key={v.r2Key} /> : null}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AppShell>
  );
}
