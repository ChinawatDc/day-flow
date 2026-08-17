import Link from "next/link";
import { createHuntVisit } from "../actions";
import { FilePreview } from "@/components/file-preview";
import { requireHuntFamily } from "@/lib/hunt/access";
import { listHuntProjects, listVisitPhotos, listVisits } from "@/lib/hunt/data";
import { isoToThaiDisplay } from "@/lib/thai-date";
import { bangkokTodayIso } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HuntVisitsPage() {
  const { familyId } = await requireHuntFamily();
  const [projects, visits] = await Promise.all([listHuntProjects(), listVisits(familyId)]);
  const photos = await listVisitPhotos(visits.map((v) => v.id));
  const photoMap = new Map<string, string[]>();
  for (const p of photos) {
    const arr = photoMap.get(p.visitId) ?? [];
    arr.push(p.r2Key);
    photoMap.set(p.visitId, arr);
  }

  return (
    <div className="grid gap-4 md:max-w-2xl">
      <form action={createHuntVisit} className="hh-card grid gap-2 p-4">
        <p className="font-semibold">เพิ่มนัดดู</p>
        <select name="projectId" required className="hh-field" defaultValue="">
          <option value="" disabled>
            เลือกโครงการ
          </option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <input className="hh-field" type="date" name="visitedOn" defaultValue={bangkokTodayIso()} required />
        <input className="hh-field" type="datetime-local" name="startsAt" />
        <input className="hh-field" name="place" placeholder="สถานที่" />
        <textarea className="hh-field min-h-20 py-2" name="summary" placeholder="สรุปหลังดู" />
        <input type="file" name="file" accept="image/*" />
        <button type="submit" className="hh-btn w-fit">
          บันทึก
        </button>
      </form>

      {visits.length === 0 ? (
        <p className="hh-card px-5 py-12 text-center text-[var(--hh-muted)]">ยังไม่มีนัดดู</p>
      ) : (
        <ul className="hh-card divide-y divide-[var(--hh-line)] overflow-hidden">
          {visits.map((v) => (
            <li key={v.id} className="px-4 py-3.5">
              <Link href={`/family/hunt/${v.projectId}`} className="font-semibold">
                {v.projectName}
              </Link>
              <p className="text-caption mt-0.5">
                {isoToThaiDisplay(String(v.visitedOn))}
                {v.place ? ` · ${v.place}` : ""}
              </p>
              {v.summary ? <p className="mt-1 text-sm">{v.summary}</p> : null}
              <div className="mt-2 flex flex-wrap gap-2">
                {(photoMap.get(v.id) ?? []).map((key) => (
                  <FilePreview key={key} r2Key={key} label="รูป" />
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
