import { HuntFilters } from "@/components/hunt/hunt-filters";
import { HuntCards, HuntTable } from "@/components/hunt/hunt-list";
import { requireHuntFamily } from "@/lib/hunt/access";
import { getCompareIds, listFamilyPicks, listHuntProjects } from "@/lib/hunt/data";
import { BUDGET_CHIPS } from "@/lib/hunt/format";

export const dynamic = "force-dynamic";

export default async function HuntIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ budget?: string; detached?: string }>;
}) {
  const { familyId } = await requireHuntFamily();
  const { budget = "all", detached } = await searchParams;
  const onlyDetached = detached === "1";
  const chip = BUDGET_CHIPS.find((c) => c.id === budget) ?? BUDGET_CHIPS[0];
  const [projects, picks, compareIds] = await Promise.all([
    listHuntProjects(),
    listFamilyPicks(familyId),
    getCompareIds(familyId),
  ]);
  const shortlisted = new Set(picks.filter((p) => p.shortlisted).map((p) => p.projectId));
  const compared = new Set(compareIds);
  const rows = projects.filter((p) => {
    if (onlyDetached && !p.hasDetached) return false;
    if (chip.satang != null && p.priceStartSatang > chip.satang) return false;
    return true;
  });

  return (
    <div>
      <HuntFilters budget={chip.id} detached={onlyDetached} />
      <p className="text-caption mb-4">{rows.length} โครงการ · ส.ค. 2026</p>
      {rows.length === 0 ? (
        <p className="hh-card px-5 py-12 text-center text-[var(--hh-muted)]">ไม่มีโครงการในช่วงงบนี้</p>
      ) : (
        <>
          <HuntCards rows={rows} shortlisted={shortlisted} compared={compared} />
          <HuntTable rows={rows} shortlisted={shortlisted} compared={compared} />
        </>
      )}
    </div>
  );
}
