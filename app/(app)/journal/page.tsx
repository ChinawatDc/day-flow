import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { FileField } from "@/components/file-field";
import { FileLink } from "@/components/file-link";
import { NotebookForm } from "@/components/notebook/notebook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { saveJournal } from "./actions";
import { getJournal } from "@/lib/data";
import { moods } from "@/lib/modules";
import { requireUser } from "@/lib/session";
import { isoToThaiDisplay } from "@/lib/thai-date";
import { addDaysIso, bangkokTodayIso } from "@/lib/utils";

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ day?: string }>;
}) {
  const user = await requireUser();
  const { day } = await searchParams;
  const entryOn = day || bangkokTodayIso();
  const { entry, photos } = await getJournal(user.id, entryOn);
  const prev = addDaysIso(entryOn, -1);
  const next = addDaysIso(entryOn, 1);

  return (
    <AppShell title="บันทึกวัน">
      <div className="mb-6 flex items-baseline gap-4">
        <Link href={`/journal?day=${prev}`} className="text-sm text-kaffir">
          ← วันก่อน
        </Link>
        <p className="text-title">{isoToThaiDisplay(entryOn)}</p>
        <Link href={`/journal?day=${next}`} className="text-sm text-kaffir">
          วันถัดไป →
        </Link>
      </div>

      <NotebookForm action={saveJournal} className="bg-paper">
        <input type="hidden" name="entryOn" value={entryOn} />
        <div className="grid gap-1.5">
          <Label htmlFor="mood">อารมณ์</Label>
          <NativeSelect id="mood" name="mood" defaultValue={entry?.mood ?? "ok"}>
            {moods.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </NativeSelect>
        </div>
        <Textarea name="body" defaultValue={entry?.body ?? ""} placeholder="วันนี้เป็นอย่างไร" />
        <FileField label="รูป" />
        <Button type="submit">บันทึก</Button>
      </NotebookForm>

      {photos.length > 0 ? (
        <ul className="mt-6 grid gap-2">
          {photos.map((p) => (
            <li key={p.id}>
              <FileLink r2Key={p.r2Key} label="รูปในบันทึก" />
            </li>
          ))}
        </ul>
      ) : null}
    </AppShell>
  );
}
