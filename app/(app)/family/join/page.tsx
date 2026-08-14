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
    await joinFamilyByCode(code);
  }
  return (
    <AppShell title="เข้าร่วมครอบครัว">
      <JoinPanel defaultCode={code} />
    </AppShell>
  );
}
