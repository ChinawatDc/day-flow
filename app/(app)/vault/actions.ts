"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db/client";
import { vaultItems } from "@/lib/db/schema";
import { deletePrivateObject } from "@/lib/r2/client";
import { requireUser } from "@/lib/session";
import { maybeUpload } from "@/lib/upload";

export async function createVaultItem(formData: FormData) {
  const user = await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("ใส่ชื่อเอกสารก่อน");
  const kindRaw = String(formData.get("kind") ?? "other");
  const kind = vaultKindsSafe(kindRaw);
  const expiresRaw = String(formData.get("expiresOn") ?? "").trim();
  const expiresOn = /^\d{4}-\d{2}-\d{2}$/.test(expiresRaw) ? expiresRaw : null;
  const file = formData.get("file");
  const r2Key = await maybeUpload(user.id, "vault", file instanceof File ? file : null);
  await getDb().insert(vaultItems).values({
    id: crypto.randomUUID(),
    userId: user.id,
    title,
    kind,
    expiresOn,
    r2Key,
  });
  revalidatePath("/vault");
  revalidatePath("/today");
  revalidatePath("/menu");
}

function vaultKindsSafe(kind: string) {
  const ok = ["id", "insurance", "contract", "other"];
  return ok.includes(kind) ? kind : "other";
}

export async function updateVaultItem(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("ใส่ชื่อเอกสารก่อน");
  const file = formData.get("file");
  const extraKey = await maybeUpload(user.id, "vault", file instanceof File ? file : null);
  const db = getDb();
  const [row] = await db
    .select()
    .from(vaultItems)
    .where(and(eq(vaultItems.id, id), eq(vaultItems.userId, user.id)))
    .limit(1);
  if (!row) throw new Error("ไม่พบเอกสาร");
  const expiresRaw = String(formData.get("expiresOn") ?? "").trim();
  const expiresOn = /^\d{4}-\d{2}-\d{2}$/.test(expiresRaw) ? expiresRaw : null;
  await db
    .update(vaultItems)
    .set({
      title,
      kind: vaultKindsSafe(String(formData.get("kind") ?? row.kind)),
      expiresOn,
      r2Key: extraKey ?? row.r2Key,
      updatedAt: new Date(),
    })
    .where(and(eq(vaultItems.id, id), eq(vaultItems.userId, user.id)));
  revalidatePath("/vault");
  revalidatePath("/today");
  revalidatePath("/menu");
}

export async function deleteVaultItem(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const db = getDb();
  const [row] = await db
    .select()
    .from(vaultItems)
    .where(and(eq(vaultItems.id, id), eq(vaultItems.userId, user.id)))
    .limit(1);
  if (row?.r2Key) await deletePrivateObject(row.r2Key);
  await db.delete(vaultItems).where(and(eq(vaultItems.id, id), eq(vaultItems.userId, user.id)));
  revalidatePath("/vault");
  revalidatePath("/today");
}
