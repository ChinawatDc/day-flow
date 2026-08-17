import { HuntFilters } from "@/components/hunt/hunt-filters";
import { HuntMap, type HuntMapPin } from "@/components/hunt/hunt-map";
import { requireHuntFamily } from "@/lib/hunt/access";
import { listHuntProjects } from "@/lib/hunt/data";
import { BUDGET_CHIPS, formatPriceRange } from "@/lib/hunt/format";
import { ITF_PIN } from "@/lib/hunt/seed";

export const dynamic = "force-dynamic";

export default async function HuntMapPage({
  searchParams,
}: {
  searchParams: Promise<{ budget?: string; detached?: string }>;
}) {
  await requireHuntFamily();
  const { budget = "all", detached } = await searchParams;
  const onlyDetached = detached === "1";
  const chip = BUDGET_CHIPS.find((c) => c.id === budget) ?? BUDGET_CHIPS[0];
  const projects = await listHuntProjects();
  const rows = projects.filter((p) => {
    if (onlyDetached && !p.hasDetached) return false;
    if (chip.satang != null && p.priceStartSatang > chip.satang) return false;
    return true;
  });

  const pins: HuntMapPin[] = [
    {
      id: "itf",
      name: ITF_PIN.label,
      lat: ITF_PIN.lat,
      lng: ITF_PIN.lng,
      priceLabel: "จุดอ้างอิง commute พฤหัส–ศุกร์",
      kind: "itf",
    },
    ...rows
      .filter((p) => p.lat && p.lng)
      .map((p) => ({
        id: p.id,
        name: p.name,
        lat: p.lat,
        lng: p.lng,
        priceLabel: formatPriceRange(p.priceStartSatang, p.priceMaxSatang, p.unitCheck),
        href: `/family/hunt/${p.id}`,
        kind: "project" as const,
        traffic: p.traffic,
      })),
  ];

  return (
    <div>
      <HuntFilters budget={chip.id} detached={onlyDetached} base="/family/hunt/map" />
      <p className="text-caption mb-4">
        {rows.length} โครงการ · พินสีตามรถติด · แตะพินเพื่อเปิดรายละเอียด
      </p>
      <HuntMap pins={pins} />
    </div>
  );
}
