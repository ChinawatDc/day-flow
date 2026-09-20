"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db/client";
import { huntBankApps, huntLoanDocs } from "@/lib/db/schema";
import { requireHuntFamily } from "@/lib/hunt/access";
import { satangFromMillion } from "@/lib/hunt/format";

function refreshLoan() {
  revalidatePath("/family/hunt/loan");
  revalidatePath("/family/hunt");
  revalidatePath("/family");
}

export async function updateDocStatus(formData: FormData) {
  const { user, familyId } = await requireHuntFamily();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "pending");

  if (!id) return;
  const db = getDb();
  await db
    .update(huntLoanDocs)
    .set({
      status,
      updatedBy: user.id,
      updatedAt: new Date(),
    })
    .where(and(eq(huntLoanDocs.id, id), eq(huntLoanDocs.familyId, familyId)));

  refreshLoan();
}

export async function updateDocDetails(formData: FormData) {
  const { user, familyId } = await requireHuntFamily();
  const id = String(formData.get("id") ?? "");
  const note = String(formData.get("note") ?? "");
  const fileUrl = String(formData.get("fileUrl") ?? "").trim() || null;

  if (!id) return;
  const db = getDb();
  await db
    .update(huntLoanDocs)
    .set({
      note,
      fileUrl,
      updatedBy: user.id,
      updatedAt: new Date(),
    })
    .where(and(eq(huntLoanDocs.id, id), eq(huntLoanDocs.familyId, familyId)));

  refreshLoan();
}

export async function addCustomDoc(formData: FormData) {
  const { user, familyId } = await requireHuntFamily();
  const title = String(formData.get("title") ?? "").trim();
  const target = String(formData.get("target") ?? "primary");
  const category = String(formData.get("category") ?? "personal");
  const description = String(formData.get("description") ?? "").trim();

  if (!title) return;
  const db = getDb();
  await db.insert(huntLoanDocs).values({
    id: crypto.randomUUID(),
    familyId,
    docKey: `custom_${Date.now()}`,
    category,
    target,
    title,
    description,
    status: "pending",
    note: "",
    fileUrl: null,
    sortOrder: 99,
    updatedBy: user.id,
  });

  refreshLoan();
}

export async function updateBankApp(formData: FormData) {
  const { user, familyId } = await requireHuntFamily();
  const bankCode = String(formData.get("bankCode") ?? "");
  const status = String(formData.get("status") ?? "preparing");
  const interestRatePercent = String(formData.get("interestRatePercent") ?? "");
  const contactPerson = String(formData.get("contactPerson") ?? "");
  const contactPhone = String(formData.get("contactPhone") ?? "");
  const note = String(formData.get("note") ?? "");

  const approvedMillionStr = String(formData.get("approvedMillion") ?? "").trim();
  const approvedAmountSatang = approvedMillionStr ? satangFromMillion(parseFloat(approvedMillionStr)) : null;

  const monthlyStr = String(formData.get("monthlyPayment") ?? "").trim();
  const monthlyPaymentSatang = monthlyStr ? Math.round(parseFloat(monthlyStr) * 100) : null;

  const submittedAtRaw = String(formData.get("submittedAt") ?? "").trim();
  const submittedAt = submittedAtRaw || null;

  if (!bankCode) return;
  const db = getDb();
  await db
    .update(huntBankApps)
    .set({
      status,
      submittedAt,
      approvedAmountSatang,
      interestRatePercent,
      monthlyPaymentSatang,
      contactPerson,
      contactPhone,
      note,
      updatedBy: user.id,
      updatedAt: new Date(),
    })
    .where(and(eq(huntBankApps.bankCode, bankCode), eq(huntBankApps.familyId, familyId)));

  refreshLoan();
}
