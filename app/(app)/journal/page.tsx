import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { FileField } from "@/components/file-field";
import { FileLink } from "@/components/file-link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/empty-state";
import { ComposerSheet } from "@/components/notebook/composer-sheet";
import { NotebookForm } from "@/components/notebook/notebook-form";
import { SoftTag } from "@/components/notebook/record-row";
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
  const MoodIcon = mood?.icon;

  return (
    <AppShell title="บันทึกวัน" subtitle={entryOn === today ? "วันนี้" : isoToThaiDisplay(entryOn)}>
      <section className="df-card-hero mb-5 p-5">
        <div className="flex items-center justify-between gap-2">
          <Button asChild variant="soft" size="icon" className="bg-surface/15 text-surface hover:bg-surface/25">
            <Link href={`/journal?day=${prev}`} aria-label="วันก่อน">
              <ChevronLeft className="size-5" />
            </Link>
          </Button>
          <div className="text-center">
            <p className="text-title text-xl text-surface">{isoToThaiDisplay(entryOn)}</p>
          </div>
          <Button asChild variant="soft" size="icon" className="bg-surface/15 text-surface hover:bg-surface/25">
            <Link href={`/journal?day=${next}`} aria-label="วันถัดไป">
              <ChevronRight className="size-5" />
            </Link>
          </Button>
        </div>
        <div className="mt-5 flex items-center justify-center gap-2">
          {MoodIcon ? (
            <>
              <MoodIcon className="size-8 text-surface" aria-hidden />
              <p className="text-display text-[2rem] text-surface">{mood?.label}</p>
            </>
          ) : (
            <p className="text-display text-[2rem] text-surface">—</p>
          )}
        </div>
      </section>

      <div className="mb-4">
        <ComposerSheet label={entry ? "แก้บันทึกวันนี้" : "เขียนบันทึก"} title="บันทึกวันนี้">
          <NotebookForm action={saveJournal}>
            <input type="hidden" name="entryOn" value={entryOn} />
            <Label>อารมณ์</Label>
            <div className="grid grid-cols-3 gap-2">
              {moods.map((m) => {
                const MoodIcon = m.icon;
                return (
                  <label
                    key={m.id}
                    className="df-card df-press flex cursor-pointer flex-col items-center gap-1.5 px-2 py-3 has-[:checked]:border-kaffir has-[:checked]:bg-kaffir has-[:checked]:text-surface"
                  >
                    <input
                      type="radio"
                      name="mood"
                      value={m.id}
                      defaultChecked={(entry?.mood ?? "ok") === m.id}
                      className="sr-only"
                    />
                    <MoodIcon className="size-6" aria-hidden />
                    <span className="text-sm font-semibold">{m.label}</span>
                  </label>
                );
              })}
            </div>
            <Label htmlFor="body">เรื่องราว</Label>
            <Textarea
              id="body"
              name="body"
              defaultValue={entry?.body ?? ""}
              placeholder="วันนี้เป็นอย่างไร… สั้นๆ ก็ได้"
              rows={7}
            />
            <FileField label="แนบรูป" accept="image/*" />
            <Button type="submit">บันทึก</Button>
          </NotebookForm>
        </ComposerSheet>
      </div>

      {entry?.body ? (
        <article className="df-card mb-5 px-4 py-5">
          <div className="mb-2 flex gap-2">
            <SoftTag tone="kaffir">{mood?.label ?? "—"}</SoftTag>
            <SoftTag>{isoToThaiDisplay(entryOn)}</SoftTag>
          </div>
          <p className="whitespace-pre-wrap text-[1.05rem] leading-relaxed">{entry.body}</p>
        </article>
      ) : (
        <EmptyState title="ยังไม่เขียนวันนี้" />
      )}

      {photos.length > 0 ? (
        <div>
          <p className="text-caption mb-2">รูปในวันนี้</p>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {photos.map((p) => (
              <li key={p.id} className="df-card overflow-hidden">
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
