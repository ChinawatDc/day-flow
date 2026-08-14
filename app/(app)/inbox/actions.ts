"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db/client";
import {
  captures,
  expenses,
  homeItems,
  journalEntries,
  tasks,
  vaultItems,
} from "@/lib/db/schema";
import { deletePrivateObject } from "@/lib/r2/client";
import { requireUser } from "@/lib/session";
import { maybeUpload } from "@/lib/upload";
import { bangkokTodayIso, satangFromBahtInput } from "@/lib/utils";

function refresh() {
  revalidatePath("/inbox");
  revalidatePath("/today");
  revalidatePath("/tasks");
  revalidatePath("/money");
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
    if (row.r2Key) await deletePrivateObject(row.r2Key);
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
  } else if (kind === "money") {
    const satang = satangFromBahtInput(String(formData.get("amount") ?? ""));
    if (satang == null) return;
    await db.insert(expenses).values({
      id: crypto.randomUUID(),
      userId: user.id,
      amountSatang: satang,
      category: String(formData.get("category") ?? "other"),
      merchant: String(formData.get("merchant") ?? row.note).trim(),
      spentOn: bangkokTodayIso(),
      receiptR2Key: row.r2Key,
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
    const extra = row.note
      ? `${existing[0]?.body ? existing[0].body + "\n" : ""}${row.note}`
      : (existing[0]?.body ?? "");
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

  await db.update(captures).set({ kind, updatedAt: new Date() }).where(eq(captures.id, id));
  refresh();
  redirect("/today");
}

export async function updateCapture(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const note = String(formData.get("note") ?? "").trim();
  await getDb()
    .update(captures)
    .set({ note, updatedAt: new Date() })
    .where(and(eq(captures.id, id), eq(captures.userId, user.id)));
  refresh();
}

export async function deleteCapture(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const db = getDb();
  const [row] = await db
    .select()
    .from(captures)
    .where(and(eq(captures.id, id), eq(captures.userId, user.id)))
    .limit(1);
  if (row?.r2Key) await deletePrivateObject(row.r2Key);
  await db.delete(captures).where(and(eq(captures.id, id), eq(captures.userId, user.id)));
  refresh();
}
