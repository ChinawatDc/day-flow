import Link from "next/link";
import { ChevronLeft, ChevronRight, Sun } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { FileField } from "@/components/file-field";
import { FileLink } from "@/components/file-link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/empty-state";
import { ComposerSheet } from "@/components/notebook/composer-sheet";
import { NotebookForm } from "@/components/notebook/notebook-form";
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
  const today = bangkokTodayIso();
  const mood = moods.find((m) => m.id === entry?.mood);

  return (
    <AppShell title="บันทึกวัน">
      <div className="mb-5 overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-kaffir via-kaffir to-kaffir-dark p-5 text-paper shadow-[0_16px_40px_rgba(45,80,58,0.28)]">
        <div className="flex items-center justify-between gap-2">
          <Button asChild variant="ghost" size="icon" className="text-paper hover:bg-paper/15">
            <Link href={`/journal?day=${prev}`} aria-label="วันก่อน">
              <ChevronLeft className="size-5" />
            </Link>
          </Button>
          <div className="text-center">
            <p className="text-sm text-paper/75">{entryOn === today ? "วันนี้" : "บันทึก"}</p>
            <p className="text-title text-xl text-paper">{isoToThaiDisplay(entryOn)}</p>
          </div>
          <Button asChild variant="ghost" size="icon" className="text-paper hover:bg-paper/15">
            <Link href={`/journal?day=${next}`} aria-label="วันถัดไป">
              <ChevronRight className="size-5" />
            </Link>
          </Button>
        </div>
        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-sm text-paper/70">อารมณ์</p>
            <p className="text-display text-[2rem] text-paper">{mood?.label ?? "—"}</p>
          </div>
          <Sun className="size-10 text-paper/35" />
        </div>
      </div>

      <div className="mb-4">
        <ComposerSheet label={entry ? "แก้บันทึกวันนี้" : "เขียนบันทึก"} title="บันทึกวันนี้">
          <NotebookForm action={saveJournal}>
            <input type="hidden" name="entryOn" value={entryOn} />
            <Label>อารมณ์</Label>
            <div className="grid grid-cols-3 gap-2">
              {moods.map((m) => (
                <label
                  key={m.id}
                  className="flex cursor-pointer flex-col items-center gap-1 rounded-2xl border border-line bg-paper-2 px-2 py-3 has-[:checked]:border-kaffir has-[:checked]:bg-kaffir has-[:checked]:text-paper"
                >
                  <input
                    type="radio"
                    name="mood"
                    value={m.id}
                    defaultChecked={(entry?.mood ?? "ok") === m.id}
                    className="sr-only"
                  />
                  <span className="text-sm font-semibold">{m.label}</span>
                </label>
              ))}
            </div>
            <Label htmlFor="body">เรื่องราว</Label>
            <Textarea
              id="body"
              name="body"
              defaultValue={entry?.body ?? ""}
              placeholder="วันนี้เป็นอย่างไร… สั้นๆ ก็ได้"
              rows={7}
              className="rounded-2xl"
            />
            <FileField label="แนบรูป" accept="image/*" />
            <Button type="submit">บันทึก</Button>
          </NotebookForm>
        </ComposerSheet>
      </div>

      {entry?.body ? (
        <article className="mb-5 rounded-2xl border border-line bg-paper px-4 py-5 shadow-[0_10px_28px_rgba(28,25,23,0.05)]">
          <p className="text-caption mb-2">บันทึก</p>
          <p className="whitespace-pre-wrap text-[1.05rem] leading-relaxed">{entry.body}</p>
        </article>
      ) : (
        <EmptyState title="ยังไม่เขียนวันนี้" hint="กดเขียนบันทึกด้านบน เลือกอารมณ์แล้วเล่าสั้นๆ" />
      )}

      {photos.length > 0 ? (
        <div>
          <p className="text-caption mb-2">รูปในวันนี้</p>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {photos.map((p) => (
              <li key={p.id} className="overflow-hidden rounded-2xl border border-line bg-paper-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/files?key=${encodeURIComponent(p.r2Key)}`}
                  alt=""
                  className="aspect-square w-full object-cover"
                />
                <div className="p-2">
                  <FileLink r2Key={p.r2Key} label="ขยาย" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </AppShell>
  );
}
