import Link from "next/link";
import { toggleCompare } from "../actions";
import { requireHuntFamily } from "@/lib/hunt/access";
import { getCompareIds, listProjectsByIds, listVotes } from "@/lib/hunt/data";
import {
  bahtPerWah,
  formatBaht,
  formatFit,
  formatPriceRange,
  formatUsable,
  formatValueStars,
  houseTypeLabel,
  trafficLabel,
} from "@/lib/hunt/format";

export const dynamic = "force-dynamic";

export default async function HuntComparePage() {
  const { familyId } = await requireHuntFamily();
  const ids = await getCompareIds(familyId);
  const [projects, votes] = await Promise.all([listProjectsByIds(ids), listVotes(familyId)]);
  const avg = (id: string) => {
    const list = votes.filter((v) => v.projectId === id);
    if (!list.length) return "—";
    return (list.reduce((s, v) => s + v.score, 0) / list.length).toFixed(1);
  };

  if (!projects.length) {
    return (
      <div className="hh-card px-5 py-14 text-center">
        <p className="text-[var(--hh-muted)]">เลือก 2–4 โครงการจากตาราง</p>
        <Link href="/family/hunt" className="hh-btn mt-5 inline-flex">
          ไปตาราง
        </Link>
      </div>
    );
  }

  const metrics: { label: string; value: (p: (typeof projects)[number]) => string }[] = [
    { label: "ราคา", value: (p) => formatPriceRange(p.priceStartSatang, p.priceMaxSatang, p.unitCheck) },
    { label: "ประเภท", value: (p) => houseTypeLabel(p.houseType, p.hasDetached, p.hasTwin) },
    { label: "โซน", value: (p) => p.zone },
    { label: "ที่ดิน", value: (p) => p.landNote || "—" },
    { label: "ใช้สอย", value: (p) => formatUsable(p.usableSqmMin, p.usableSqmMax) || "—" },
    {
      label: "บาท/ตร.ว.",
      value: (p) => {
        const n = bahtPerWah(p.priceStartSatang, p.landWahTenths);
        return n != null ? formatBaht(n) : "—";
      },
    },
    {
      label: "ห้อง/จอด",
      value: (p) => `${p.bedrooms ?? "—"} / ${p.bathrooms ?? "—"} / ${p.parking ?? "—"}`,
    },
    { label: "เหมาะ", value: (p) => formatFit(p.fitScore) },
    { label: "คุ้ม", value: (p) => formatValueStars(p.valueScore) },
    { label: "โหวตบ้าน", value: (p) => avg(p.id) },
    { label: "รถติด", value: (p) => trafficLabel(p.traffic) },
    { label: "เส้นทาง ITF", value: (p) => p.commuteNote },
  ];

  return (
    <div className="grid gap-4">
      <div className="flex gap-2 overflow-x-auto md:hidden">
        {projects.map((p) => (
          <article key={p.id} className="hh-card min-w-[16rem] flex-1 p-4">
            <Link href={`/family/hunt/${p.id}`} className="font-semibold">
              {p.name}
            </Link>
            <p className="hh-gold mt-2 text-xl">
              {formatPriceRange(p.priceStartSatang, p.priceMaxSatang, p.unitCheck)}
            </p>
            {metrics.map((m) => (
              <div key={m.label} className="mt-3 border-t border-[var(--hh-line)] pt-2">
                <p className="text-caption">{m.label}</p>
                <p className="text-sm leading-snug">{m.value(p)}</p>
              </div>
            ))}
            <form action={toggleCompare} className="mt-4">
              <input type="hidden" name="projectId" value={p.id} />
              <button type="submit" className="hh-btn hh-btn-ghost h-9 w-full">
                เอาออก
              </button>
            </form>
          </article>
        ))}
      </div>

      <div className="hh-card hidden overflow-x-auto md:block">
        <table className="hh-table">
          <thead>
            <tr>
              <th className="min-w-[7rem]">หัวข้อ</th>
              {projects.map((p) => (
                <th key={p.id} className="min-w-[12rem]">
                  <Link href={`/family/hunt/${p.id}`}>{p.name}</Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((m) => (
              <tr key={m.label}>
                <td className="text-[var(--hh-muted)]">{m.label}</td>
                {projects.map((p) => (
                  <td key={p.id}>{m.value(p)}</td>
                ))}
              </tr>
            ))}
            <tr>
              <td></td>
              {projects.map((p) => (
                <td key={p.id}>
                  <form action={toggleCompare}>
                    <input type="hidden" name="projectId" value={p.id} />
                    <button type="submit" className="hh-btn hh-btn-ghost h-8 px-3 text-xs">
                      เอาออก
                    </button>
                  </form>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
