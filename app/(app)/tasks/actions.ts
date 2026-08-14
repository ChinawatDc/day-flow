"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db/client";
import { tasks } from "@/lib/db/schema";
import { requireUser } from "@/lib/session";

export async function createTask(formData: FormData) {
  const user = await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const dueOn = String(formData.get("dueOn") ?? "") || null;
  const note = String(formData.get("note") ?? "").trim();
  await getDb().insert(tasks).values({
    id: crypto.randomUUID(),
    userId: user.id,
    title,
    note,
    dueOn,
  });
  revalidatePath("/tasks");
  revalidatePath("/today");
}

export async function toggleTask(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const done = String(formData.get("done")) === "1";
  await getDb()
    .update(tasks)
    .set({ doneAt: done ? new Date() : null })
    .where(and(eq(tasks.id, id), eq(tasks.userId, user.id)));
  revalidatePath("/tasks");
  revalidatePath("/today");
}

export async function deleteTask(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  await getDb().delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, user.id)));
  revalidatePath("/tasks");
  revalidatePath("/today");
}
