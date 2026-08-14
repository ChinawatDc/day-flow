import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { FileField } from "@/components/file-field";
import { FileLink } from "@/components/file-link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/empty-state";
import { ComposerSheet } from "@/components/notebook/composer-sheet";
import { NotebookForm } from "@/components/notebook/notebook-form";
import { RecordRow } from "@/components/notebook/record-row";
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
  const moodLabel = moods.find((m) => m.id === entry?.mood)?.label ?? "—";

  return (
    <AppShell title="บันทึกวัน">
      <div className="mb-5 flex items-baseline justify-between gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href={`/journal?day=${prev}`}>วันก่อน</Link>
        </Button>
        <p className="text-title">{isoToThaiDisplay(entryOn)}</p>
        <Button asChild variant="outline" size="sm">
          <Link href={`/journal?day=${next}`}>วันถัดไป</Link>
        </Button>
      </div>
      <p className="text-caption mb-4">อารมณ์ {moodLabel}</p>
      <div className="mb-4">
        <ComposerSheet label={entry ? "แก้บันทึก" : "เขียน"} title="บันทึกวันนี้">
          <NotebookForm action={saveJournal}>
            <input type="hidden" name="entryOn" value={entryOn} />
            <Label htmlFor="mood">อารมณ์</Label>
            <NativeSelect id="mood" name="mood" defaultValue={entry?.mood ?? "ok"}>
              {moods.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </NativeSelect>
            <Textarea name="body" defaultValue={entry?.body ?? ""} placeholder="วันนี้เป็นอย่างไร" rows={6} />
            <FileField label="รูป" />
            <Button type="submit">บันทึก</Button>
          </NotebookForm>
        </ComposerSheet>
      </div>
      {entry?.body ? <p className="mb-4 whitespace-pre-wrap text-sm">{entry.body}</p> : (
        <EmptyState title="ยังไม่เขียนวันนี้" hint="กดเขียนด้านบน" />
      )}
      {photos.length > 0 ? (
        <ul className="grid gap-2">
          {photos.map((p) => (
            <RecordRow key={p.id} title="รูปในบันทึก" actions={<FileLink r2Key={p.r2Key} label="เปิด" />} />
          ))}
        </ul>
      ) : null}
    </AppShell>
  );
}
