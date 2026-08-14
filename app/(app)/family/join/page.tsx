import { AppShell } from "@/components/app-shell";
import { JoinPanel } from "@/components/family/join-panel";
import { joinFamilyByCode } from "../actions";
import { getMembership } from "@/lib/family/data";
import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function FamilyJoinPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const user = await requireUser();
  if (await getMembership(user.id)) redirect("/family");
  const { code = "" } = await searchParams;
  if (code) {
    const err = await joinFamilyByCode(code);
    if (!err) redirect("/family");
    return (
      <AppShell title="เข้าร่วมครอบครัว">
        <p className="mb-4 text-sm text-orange">{err}</p>
        <JoinPanel defaultCode={code} />
      </AppShell>
    );
  }
  return (
    <AppShell title="เข้าร่วมครอบครัว">
      <JoinPanel />
    </AppShell>
  );
}
