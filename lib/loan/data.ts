import { and, asc, eq } from "drizzle-orm";
import { getDb, getSql } from "@/lib/db/client";
import { huntBankApps, huntLoanDocs } from "@/lib/db/schema";
import { DEFAULT_BANKS, DEFAULT_LOAN_DOCS } from "./default-data";

let tablesEnsured = false;

async function ensureTablesExist() {
  if (tablesEnsured) return;
  try {
    const sql = getSql();
    await sql`
      CREATE TABLE IF NOT EXISTS "hunt_loan_docs" (
        "id" text PRIMARY KEY,
        "family_id" text NOT NULL REFERENCES "families"("id") ON DELETE CASCADE,
        "doc_key" text NOT NULL,
        "category" text NOT NULL,
        "target" text NOT NULL,
        "title" text NOT NULL,
        "description" text NOT NULL DEFAULT '',
        "status" text NOT NULL DEFAULT 'pending',
        "note" text NOT NULL DEFAULT '',
        "file_url" text,
        "sort_order" integer NOT NULL DEFAULT 0,
        "updated_by" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "updated_at" timestamp NOT NULL DEFAULT now()
      );
    `;
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS "hunt_loan_doc_family_target_key" ON "hunt_loan_docs" ("family_id", "target", "doc_key");
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS "hunt_bank_apps" (
        "id" text PRIMARY KEY,
        "family_id" text NOT NULL REFERENCES "families"("id") ON DELETE CASCADE,
        "bank_code" text NOT NULL,
        "bank_name" text NOT NULL,
        "color" text NOT NULL DEFAULT '#4b5563',
        "status" text NOT NULL DEFAULT 'preparing',
        "submitted_at" date,
        "approved_amount_satang" integer,
        "interest_rate_percent" text NOT NULL DEFAULT '',
        "monthly_payment_satang" integer,
        "contact_person" text NOT NULL DEFAULT '',
        "contact_phone" text NOT NULL DEFAULT '',
        "note" text NOT NULL DEFAULT '',
        "updated_by" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "updated_at" timestamp NOT NULL DEFAULT now()
      );
    `;
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS "hunt_bank_app_family_bank" ON "hunt_bank_apps" ("family_id", "bank_code");
    `;
    tablesEnsured = true;
  } catch (err) {
    console.error("ensureTablesExist error:", err);
  }
}

export async function ensureLoanTrackerSeeded(familyId: string, userId: string) {
  await ensureTablesExist();

  const db = getDb();

  try {
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

    // Update titles and descriptions for existing docs if they changed
    for (const t of DEFAULT_LOAN_DOCS) {
      await db
        .update(huntLoanDocs)
        .set({
          title: t.title,
          description: t.description,
          category: t.category,
          sortOrder: t.sortOrder,
        })
        .where(
          and(
            eq(huntLoanDocs.familyId, familyId),
            eq(huntLoanDocs.target, t.target),
            eq(huntLoanDocs.docKey, t.docKey),
          ),
        );
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
  } catch (err) {
    console.error("ensureLoanTrackerSeeded error:", err);
  }
}

export async function listFamilyLoanDocs(familyId: string) {
  await ensureTablesExist();
  const db = getDb();
  try {
    return await db
      .select()
      .from(huntLoanDocs)
      .where(eq(huntLoanDocs.familyId, familyId))
      .orderBy(asc(huntLoanDocs.sortOrder));
  } catch (err) {
    console.error("listFamilyLoanDocs error:", err);
    return [];
  }
}

export async function listFamilyBankApps(familyId: string) {
  await ensureTablesExist();
  const db = getDb();
  try {
    return await db.select().from(huntBankApps).where(eq(huntBankApps.familyId, familyId));
  } catch (err) {
    console.error("listFamilyBankApps error:", err);
    return [];
  }
}
