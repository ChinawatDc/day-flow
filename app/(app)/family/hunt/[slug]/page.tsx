import Link from "next/link";
import { notFound } from "next/navigation";
import { createHuntVisit, saveHuntNote, saveHuntVote, toggleCompare, toggleShortlist } from "../actions";
import { FilePreview } from "@/components/file-preview";
import { requireHuntFamily } from "@/lib/hunt/access";
import {
  getCompareIds,
  getHuntProject,
  getPick,
  listPriceNotes,
  listVisitPhotos,
  listVisits,
  listVotes,
} from "@/lib/hunt/data";
import {
  bahtPerWah,
  formatBaht,
  formatFit,
  formatMillion,
  formatUsable,
  formatValueStars,
  houseTypeLabel,
} from "@/lib/hunt/format";
import { isoToThaiDisplay } from "@/lib/thai-date";
import { bangkokTodayIso } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HuntDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { user, familyId } = await requireHuntFamily();
  const { slug } = await params;
  const project = await getHuntProject(slug);
  if (!project) notFound();
  const [notes, pick, votes, compareIds, visits] = await Promise.all([
    listPriceNotes(project.id),
    getPick(familyId, project.id),
    listVotes(familyId, project.id),
    getCompareIds(familyId),
    listVisits(familyId),
  ]);
  const mine = visits.filter((v) => v.projectId === project.id);
  const photos = await listVisitPhotos(mine.map((v) => v.id));
  const photoMap = new Map<string, string[]>();
  for (const p of photos) {
    const arr = photoMap.get(p.visitId) ?? [];
    arr.push(p.r2Key);
    photoMap.set(p.visitId, arr);
  }
  const myVote = votes.find((v) => v.userId === user.id);
  const avg =
    votes.length > 0 ? (votes.reduce((s, v) => s + v.score, 0) / votes.length).toFixed(1) : "—";
  const perWah = bahtPerWah(project.priceStartSatang, project.landWahTenths);

  return (
    <div className="grid gap-4 md:max-w-3xl">
      <div className="hh-card p-5">
        <p className="hh-gold text-sm">#{project.rank}</p>
        <h2 className="mt-1 font-[family-name:var(--font-title)] text-2xl font-semibold">{project.name}</h2>
        <p className="text-caption mt-1">
          {project.developer} · {project.zone} · {houseTypeLabel(project.houseType, project.hasDetached, project.hasTwin)}
        </p>
        <p className="hh-gold mt-4 text-3xl">{formatMillion(project.priceStartSatang)}</p>
        <p className="text-caption mt-1">{project.priceNote}</p>
        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-caption">ที่ดิน</dt>
            <dd>{project.landNote || "—"}</dd>
          </div>
          <div>
            <dt className="text-caption">ใช้สอย</dt>
            <dd>{formatUsable(project.usableSqmMin, project.usableSqmMax) || "—"}</dd>
          </div>
          <div>
            <dt className="text-caption">เหมาะกับคุณ</dt>
            <dd>{formatFit(project.fitScore)}</dd>
          </div>
          <div>
            <dt className="text-caption">ความคุ้ม</dt>
            <dd>{formatValueStars(project.valueScore)}</dd>
          </div>
          <div>
            <dt className="text-caption">ต่อตร.ว. (โดยประมาณ)</dt>
            <dd>{perWah != null ? formatBaht(perWah) : "—"}</dd>
          </div>
          <div>
            <dt className="text-caption">ห้อง / จอด</dt>
            <dd>
              {project.bedrooms ?? "—"} นอน · {project.bathrooms ?? "—"} น้ำ · {project.parking ?? "—"} จอด
            </dd>
          </div>
        </dl>
        <p className="mt-5 text-sm leading-relaxed">{project.commuteNote}</p>
        {project.sizeNote ? <p className="text-caption mt-2">{project.sizeNote}</p> : null}
        {project.caveat ? <p className="mt-3 text-sm text-[var(--hh-gold)]">{project.caveat}</p> : null}
        <div className="mt-5 flex flex-wrap gap-2">
          <form action={toggleShortlist}>
            <input type="hidden" name="projectId" value={project.id} />
            <button type="submit" className={pick?.shortlisted ? "hh-btn" : "hh-btn hh-btn-ghost"}>
              {pick?.shortlisted ? "อยู่ใน shortlist" : "เก็บ shortlist"}
            </button>
          </form>
          <form action={toggleCompare}>
            <input type="hidden" name="projectId" value={project.id} />
            <button type="submit" className={compareIds.includes(project.id) ? "hh-btn" : "hh-btn hh-btn-ghost"}>
              {compareIds.includes(project.id) ? "อยู่ในเทียบ" : "ใส่เทียบ"}
            </button>
          </form>
          <Link href="/family/hunt/compare" className="hh-btn hh-btn-ghost">
            เปิดเทียบ
          </Link>
        </div>
      </div>

      <div className="hh-card p-5">
        <p className="font-semibold">แหล่งราคา</p>
        <ul className="mt-3 grid gap-2">
          {notes.map((n) => (
            <li key={n.id} className="text-sm">
              <span className="text-[var(--hh-gold)]">{n.source}</span>
              {n.priceSatang != null ? ` · ${formatMillion(n.priceSatang)}` : ""}
              <span className="text-caption"> · {isoToThaiDisplay(String(n.asOf))}</span>
              <p className="text-caption">{n.note}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="hh-card p-5">
        <p className="font-semibold">โหวตของบ้าน</p>
        <p className="text-caption mt-1">เฉลี่ย {avg} จาก {votes.length} คน</p>
        <ul className="mt-2 text-sm">
          {votes.map((v) => (
            <li key={v.id}>
              {v.name} · {v.score}/10
            </li>
          ))}
        </ul>
        <form action={saveHuntVote} className="mt-4 flex items-end gap-2">
          <input type="hidden" name="projectId" value={project.id} />
          <label className="grid flex-1 gap-1 text-sm">
            คะแนนคุณ (1–10)
            <input
              className="hh-field"
              name="score"
              type="number"
              min={1}
              max={10}
              defaultValue={myVote?.score ?? 8}
              required
            />
          </label>
          <button type="submit" className="hh-btn">
            บันทึก
          </button>
        </form>
      </div>

      <div className="hh-card p-5">
        <p className="font-semibold">โน้ตร่วม</p>
        <form action={saveHuntNote} className="mt-3 grid gap-2">
          <input type="hidden" name="projectId" value={project.id} />
          <textarea name="note" className="hh-field min-h-28 py-2" defaultValue={pick?.note ?? ""} />
          <button type="submit" className="hh-btn w-fit">
            บันทึกโน้ต
          </button>
        </form>
      </div>

      <div className="hh-card p-5">
        <p className="font-semibold">นัดดู</p>
        <form action={createHuntVisit} className="mt-3 grid gap-2">
          <input type="hidden" name="projectId" value={project.id} />
          <label className="grid gap-1 text-sm">
            วันที่
            <input className="hh-field" type="date" name="visitedOn" defaultValue={bangkokTodayIso()} required />
          </label>
          <label className="grid gap-1 text-sm">
            เวลา (ลงปฏิทินครอบครัว)
            <input className="hh-field" type="datetime-local" name="startsAt" />
          </label>
          <label className="grid gap-1 text-sm">
            สถานที่
            <input className="hh-field" name="place" defaultValue={project.zone} />
          </label>
          <label className="grid gap-1 text-sm">
            สรุปหลังดู
            <textarea className="hh-field min-h-20 py-2" name="summary" />
          </label>
          <label className="grid gap-1 text-sm">
            รูป
            <input className="text-sm" type="file" name="file" accept="image/*" />
          </label>
          <button type="submit" className="hh-btn w-fit">
            เพิ่มนัดดู
          </button>
        </form>
        <ul className="mt-4 grid gap-3">
          {mine.map((v) => (
            <li key={v.id} className="border-t border-[var(--hh-line)] pt-3 text-sm">
              <p>{isoToThaiDisplay(String(v.visitedOn))}</p>
              {v.summary ? <p className="text-caption mt-1">{v.summary}</p> : null}
              <div className="mt-2 flex flex-wrap gap-2">
                {(photoMap.get(v.id) ?? []).map((key) => (
                  <FilePreview key={key} r2Key={key} label="รูป" />
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
