import { asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { huntBankApps, huntLoanDocs } from "@/lib/db/schema";
import { DEFAULT_BANKS, DEFAULT_LOAN_DOCS } from "./default-data";

export async function ensureLoanTrackerSeeded(familyId: string, userId: string) {
  const db = getDb();

  // Check existing docs
  const existingDocs = await db
    .select({ id: huntLoanDocs.id, docKey: huntLoanDocs.docKey, target: huntLoanDocs.target })
    .from(huntLoanDocs)
    .where(eq(huntLoanDocs.familyId, familyId));

  const existingDocSet = new Set(existingDocs.map((d) => `${d.target}:${d.docKey}`));
  const docsToInsert = DEFAULT_LOAN_DOCS.filter(
    (d) => !existingDocSet.has(`${d.target}:${d.docKey}`),
  ).map((d) => ({
    id: crypto.randomUUID(),
    familyId,
    docKey: d.docKey,
    category: d.category,
    target: d.target,
    title: d.title,
    description: d.description,
    status: "pending",
    note: "",
    fileUrl: null,
    sortOrder: d.sortOrder,
    updatedBy: userId,
  }));

  if (docsToInsert.length > 0) {
    await db.insert(huntLoanDocs).values(docsToInsert);
  }

  // Check existing banks
  const existingBanks = await db
    .select({ id: huntBankApps.id, bankCode: huntBankApps.bankCode })
    .from(huntBankApps)
    .where(eq(huntBankApps.familyId, familyId));

  const existingBankSet = new Set(existingBanks.map((b) => b.bankCode));
  const banksToInsert = DEFAULT_BANKS.filter((b) => !existingBankSet.has(b.bankCode)).map((b) => ({
    id: crypto.randomUUID(),
    familyId,
    bankCode: b.bankCode,
    bankName: b.bankName,
    color: b.color,
    status: "preparing",
    submittedAt: null,
    approvedAmountSatang: null,
    interestRatePercent: "",
    monthlyPaymentSatang: null,
    contactPerson: "",
    contactPhone: "",
    note: "",
    updatedBy: userId,
  }));

  if (banksToInsert.length > 0) {
    await db.insert(huntBankApps).values(banksToInsert);
  }
}

export async function listFamilyLoanDocs(familyId: string) {
  const db = getDb();
  return db
    .select()
    .from(huntLoanDocs)
    .where(eq(huntLoanDocs.familyId, familyId))
    .orderBy(asc(huntLoanDocs.sortOrder));
}

export async function listFamilyBankApps(familyId: string) {
  const db = getDb();
  return db.select().from(huntBankApps).where(eq(huntBankApps.familyId, familyId));
}
