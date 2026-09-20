import { LoanTrackerClient } from "@/components/hunt/loan-tracker-client";
import { requireHuntFamily } from "@/lib/hunt/access";
import { ensureLoanTrackerSeeded, listFamilyBankApps, listFamilyLoanDocs } from "@/lib/loan/data";

export const dynamic = "force-dynamic";

export default async function LoanPage() {
  const { user, familyId } = await requireHuntFamily();

  // Ensure default documents and banks are populated for this family
  await ensureLoanTrackerSeeded(familyId, user.id);

  const [docs, banks] = await Promise.all([
    listFamilyLoanDocs(familyId),
    listFamilyBankApps(familyId),
  ]);

  return <LoanTrackerClient docs={docs} banks={banks} />;
}
