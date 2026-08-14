"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db/client";
import { journalEntries, journalPhotos } from "@/lib/db/schema";
import { requireUser } from "@/lib/session";
import { maybeUpload } from "@/lib/upload";
import { bangkokTodayIso } from "@/lib/utils";

export async function saveJournal(formData: FormData) {
  const user = await requireUser();
  const entryOn = String(formData.get("entryOn") ?? bangkokTodayIso());
  const body = String(formData.get("body") ?? "");
  const mood = String(formData.get("mood") ?? "ok");
  const db = getDb();
  const existing = await db
    .select()
    .from(journalEntries)
    .where(and(eq(journalEntries.userId, user.id), eq(journalEntries.entryOn, entryOn)))
    .limit(1);

  let entryId = existing[0]?.id;
  if (entryId) {
    await db
      .update(journalEntries)
      .set({ body, mood, updatedAt: new Date() })
      .where(eq(journalEntries.id, entryId));
  } else {
    entryId = crypto.randomUUID();
    await db.insert(journalEntries).values({
      id: entryId,
      userId: user.id,
      entryOn,
      body,
      mood,
    });
  }

  const file = formData.get("file");
  const key = await maybeUpload(user.id, "journal", file instanceof File ? file : null);
  if (key) {
    await db.insert(journalPhotos).values({
      id: crypto.randomUUID(),
      entryId,
      r2Key: key,
    });
  }

  revalidatePath("/journal");
  revalidatePath("/today");
}
