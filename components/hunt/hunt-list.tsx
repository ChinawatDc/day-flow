import Link from "next/link";
import { Columns3, Star } from "lucide-react";
import { toggleCompare, toggleShortlist } from "@/app/(app)/family/hunt/actions";
import { HuntMapModalButton } from "@/components/hunt/hunt-map-modal";
import {
  formatFit,
  formatPriceRange,
  formatUsable,
  formatValueStars,
  houseTypeLabel,
} from "@/lib/hunt/format";

export type HuntRow = {
  id: string;
  name: string;
  developer: string;
  zone: string;
  houseType: string;
  hasDetached: boolean;
  hasTwin: boolean;
  priceStartSatang: number;
  priceMaxSatang?: number | null;
  priceNote: string;
  landNote: string;
  usableSqmMin: number | null;
  usableSqmMax: number | null;
  fitScore: number;
  valueScore: number;
  rank: number;
  unitCheck?: boolean;
  lat?: string | null;
  lng?: string | null;
  traffic?: string;
};

export function HuntCards({
  rows,
  shortlisted,
  compared,
}: {
  rows: HuntRow[];
  shortlisted: Set<string>;
  compared: Set<string>;
}) {
  return (
    <ul className="grid gap-3 md:hidden">
      {rows.map((p) => (
        <li key={p.id} className="hh-card p-4">
          <Link href={`/family/hunt/${p.id}`} className="block">
            <div className="flex items-baseline justify-between gap-2">
              <p className="hh-gold text-sm">#{p.rank}</p>
              <p className="hh-gold text-lg">
                {formatPriceRange(p.priceStartSatang, p.priceMaxSatang, p.unitCheck)}
              </p>
            </div>
            <p className="mt-1 font-[family-name:var(--font-title)] text-base font-semibold">{p.name}</p>
            <p className="text-caption mt-1">
              {p.zone} · {houseTypeLabel(p.houseType, p.hasDetached, p.hasTwin)}
            </p>
            <p className="text-caption mt-1">
              {p.landNote || formatUsable(p.usableSqmMin, p.usableSqmMax)} · เหมาะ {formatFit(p.fitScore)} · คุ้ม{" "}
              {formatValueStars(p.valueScore)}
              {p.unitCheck ? " · ต้องเช็กแปลงจริง" : ""}
            </p>
          </Link>
          <div className="mt-3 flex gap-2">
            <HuntMapModalButton project={p} />
            <form action={toggleShortlist}>
              <input type="hidden" name="projectId" value={p.id} />
              <button type="submit" className={shortlisted.has(p.id) ? "hh-btn-soft hh-btn h-9 px-3" : "hh-btn-ghost hh-btn h-9 px-3"}>
                <Star className="size-3.5" />
                เก็บ
              </button>
            </form>
            <form action={toggleCompare}>
              <input type="hidden" name="projectId" value={p.id} />
              <button type="submit" className={compared.has(p.id) ? "hh-btn-soft hh-btn h-9 px-3" : "hh-btn-ghost hh-btn h-9 px-3"}>
                <Columns3 className="size-3.5" />
                เทียบ
              </button>
            </form>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function HuntTable({
  rows,
  shortlisted,
  compared,
}: {
  rows: HuntRow[];
  shortlisted: Set<string>;
  compared: Set<string>;
}) {
  return (
    <div className="hh-card hidden overflow-x-auto md:block">
      <table className="hh-table">
        <thead>
          <tr>
            <th>#</th>
            <th>โครงการ</th>
            <th>โซน</th>
            <th>ราคาเริ่ม</th>
            <th>ขนาด</th>
            <th>เหมาะ / คุ้ม</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id}>
              <td className="hh-gold">{p.rank}</td>
              <td>
                <Link href={`/family/hunt/${p.id}`} className="font-semibold hover:text-[var(--hh-gold)]">
                  {p.name}
                </Link>
                <p className="text-caption mt-0.5">
                  {p.developer} · {houseTypeLabel(p.houseType, p.hasDetached, p.hasTwin)}
                </p>
              </td>
              <td>{p.zone}</td>
              <td>
                <span className="hh-gold">
                  {formatPriceRange(p.priceStartSatang, p.priceMaxSatang, p.unitCheck)}
                </span>
                {p.unitCheck ? <p className="text-caption mt-0.5">ต้องเช็กแปลงจริง</p> : null}
                {p.priceNote ? <p className="text-caption mt-0.5 max-w-[14rem]">{p.priceNote}</p> : null}
              </td>
              <td>
                <p>{p.landNote || "—"}</p>
                <p className="text-caption">{formatUsable(p.usableSqmMin, p.usableSqmMax)}</p>
              </td>
              <td>
                {formatFit(p.fitScore)} / {formatValueStars(p.valueScore)}
              </td>
              <td>
                <div className="flex gap-1.5">
                  <HuntMapModalButton project={p} compact />
                  <form action={toggleShortlist}>
                    <input type="hidden" name="projectId" value={p.id} />
                    <button type="submit" className={shortlisted.has(p.id) ? "hh-btn-soft hh-btn h-8 px-2.5 text-xs" : "hh-btn-ghost hh-btn h-8 px-2.5 text-xs"}>
                      เก็บ
                    </button>
                  </form>
                  <form action={toggleCompare}>
                    <input type="hidden" name="projectId" value={p.id} />
                    <button type="submit" className={compared.has(p.id) ? "hh-btn-soft hh-btn h-8 px-2.5 text-xs" : "hh-btn-ghost hh-btn h-8 px-2.5 text-xs"}>
                      เทียบ
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
