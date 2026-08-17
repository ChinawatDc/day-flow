import { HuntCards, HuntTable } from "@/components/hunt/hunt-list";
import { requireHuntFamily } from "@/lib/hunt/access";
import { getCompareIds, listFamilyPicks, listHuntProjects } from "@/lib/hunt/data";

export const dynamic = "force-dynamic";

export default async function HuntShortlistPage() {
  const { familyId } = await requireHuntFamily();
  const [projects, picks, compareIds] = await Promise.all([
    listHuntProjects(),
    listFamilyPicks(familyId),
    getCompareIds(familyId),
  ]);
  const ids = new Set(picks.filter((p) => p.shortlisted).map((p) => p.projectId));
  const rows = projects.filter((p) => ids.has(p.id));
  const compared = new Set(compareIds);

  return (
    <div>
      <p className="text-caption mb-4">{rows.length} ตัวที่บ้านเก็บไว้</p>
      {rows.length === 0 ? (
        <p className="hh-card px-5 py-12 text-center text-[var(--hh-muted)]">ยังไม่มี shortlist — กดเก็บจากตาราง</p>
      ) : (
        <>
          <HuntCards rows={rows} shortlisted={ids} compared={compared} />
          <HuntTable rows={rows} shortlisted={ids} compared={compared} />
        </>
      )}
    </div>
  );
}
