"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db/client";
import { vaultItems } from "@/lib/db/schema";
import { requireUser } from "@/lib/session";
import { maybeUpload } from "@/lib/upload";

export async function createVaultItem(formData: FormData) {
  const user = await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const file = formData.get("file");
  const r2Key = await maybeUpload(user.id, "vault", file instanceof File ? file : null);
  const expiresOn = String(formData.get("expiresOn") ?? "") || null;
  await getDb().insert(vaultItems).values({
    id: crypto.randomUUID(),
    userId: user.id,
    title,
    kind: String(formData.get("kind") ?? "other"),
    expiresOn,
    r2Key,
  });
  revalidatePath("/vault");
  revalidatePath("/today");
}

export async function deleteVaultItem(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  await getDb().delete(vaultItems).where(and(eq(vaultItems.id, id), eq(vaultItems.userId, user.id)));
  revalidatePath("/vault");
  revalidatePath("/today");
}
