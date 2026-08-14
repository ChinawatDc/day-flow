"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db/client";
import { captures, homeItems, journalEntries, tasks, vaultItems } from "@/lib/db/schema";
import { requireUser } from "@/lib/session";
import { maybeUpload } from "@/lib/upload";
import { bangkokTodayIso } from "@/lib/utils";

function refresh() {
  revalidatePath("/inbox");
  revalidatePath("/today");
  revalidatePath("/tasks");
  revalidatePath("/vault");
  revalidatePath("/home");
  revalidatePath("/journal");
}

export async function createCapture(formData: FormData) {
  const user = await requireUser();
  const note = String(formData.get("note") ?? "").trim();
  const file = formData.get("file");
  const r2Key = await maybeUpload(user.id, "captures", file instanceof File ? file : null);
  if (!note && !r2Key) return;
  await getDb().insert(captures).values({
    id: crypto.randomUUID(),
    userId: user.id,
    note,
    kind: "unfiled",
    r2Key,
  });
  refresh();
}

export async function fileCapture(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const kind = String(formData.get("kind"));
  const db = getDb();
  const [row] = await db
    .select()
    .from(captures)
    .where(and(eq(captures.id, id), eq(captures.userId, user.id)))
    .limit(1);
  if (!row) return;

  if (kind === "discard") {
    await db.delete(captures).where(eq(captures.id, id));
    refresh();
    return;
  }

  if (kind === "task") {
    await db.insert(tasks).values({
      id: crypto.randomUUID(),
      userId: user.id,
      title: row.note || "จากจดด่วน",
      note: "",
      dueOn: bangkokTodayIso(),
    });
  } else if (kind === "vault") {
    await db.insert(vaultItems).values({
      id: crypto.randomUUID(),
      userId: user.id,
      title: row.note || "จากจดด่วน",
      kind: "other",
      r2Key: row.r2Key,
    });
  } else if (kind === "home") {
    await db.insert(homeItems).values({
      id: crypto.randomUUID(),
      userId: user.id,
      name: row.note || "จากจดด่วน",
      r2Key: row.r2Key,
    });
  } else if (kind === "journal") {
    const today = bangkokTodayIso();
    const existing = await db
      .select()
      .from(journalEntries)
      .where(and(eq(journalEntries.userId, user.id), eq(journalEntries.entryOn, today)))
      .limit(1);
    const extra = row.note ? `${existing[0]?.body ? existing[0].body + "\n" : ""}${row.note}` : existing[0]?.body ?? "";
    if (existing[0]) {
      await db
        .update(journalEntries)
        .set({ body: extra, updatedAt: new Date() })
        .where(eq(journalEntries.id, existing[0].id));
    } else {
      await db.insert(journalEntries).values({
        id: crypto.randomUUID(),
        userId: user.id,
        entryOn: today,
        body: extra,
        mood: "ok",
      });
    }
  }

  await db.update(captures).set({ kind }).where(eq(captures.id, id));
  refresh();
}

export async function deleteCapture(formData: FormData) {
  const user = await requireUser();
  await getDb()
    .delete(captures)
    .where(and(eq(captures.id, String(formData.get("id"))), eq(captures.userId, user.id)));
  refresh();
}
