"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db/client";
import { expenses } from "@/lib/db/schema";
import { deletePrivateObject } from "@/lib/r2/client";
import { requireUser } from "@/lib/session";
import { maybeUpload } from "@/lib/upload";
import { bangkokTodayIso, satangFromBahtInput } from "@/lib/utils";

export async function createExpense(formData: FormData) {
  const user = await requireUser();
  const satang = satangFromBahtInput(String(formData.get("amount") ?? ""));
  if (satang == null) return;
  const file = formData.get("file");
  const receiptR2Key = await maybeUpload(
    user.id,
    "receipts",
    file instanceof File ? file : null,
  );
  await getDb().insert(expenses).values({
    id: crypto.randomUUID(),
    userId: user.id,
    amountSatang: satang,
    category: String(formData.get("category") ?? "other"),
    merchant: String(formData.get("merchant") ?? "").trim(),
    spentOn: String(formData.get("spentOn") ?? bangkokTodayIso()),
    receiptR2Key,
  });
  revalidatePath("/money");
  revalidatePath("/today");
}

export async function deleteExpense(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const db = getDb();
  const [row] = await db
    .select()
    .from(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.userId, user.id)))
    .limit(1);
  if (row?.receiptR2Key) await deletePrivateObject(row.receiptR2Key);
  await db.delete(expenses).where(and(eq(expenses.id, id), eq(expenses.userId, user.id)));
  revalidatePath("/money");
  revalidatePath("/today");
}
