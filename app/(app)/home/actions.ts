"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db/client";
import { homeBills, homeItems, shoppingItems } from "@/lib/db/schema";
import { deletePrivateObject } from "@/lib/r2/client";
import { requireUser } from "@/lib/session";
import { maybeUpload } from "@/lib/upload";
import { satangFromBahtInput } from "@/lib/utils";

function refresh() {
  revalidatePath("/home");
  revalidatePath("/today");
}

export async function createHomeItem(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const file = formData.get("file");
  const r2Key = await maybeUpload(user.id, "home", file instanceof File ? file : null);
  await getDb().insert(homeItems).values({
    id: crypto.randomUUID(),
    userId: user.id,
    name,
    location: String(formData.get("location") ?? "").trim(),
    quantity: Number(formData.get("quantity") ?? 1) || 1,
    r2Key,
  });
  refresh();
}

export async function updateHomeItem(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const file = formData.get("file");
  const extraKey = await maybeUpload(user.id, "home", file instanceof File ? file : null);
  const db = getDb();
  const [row] = await db
    .select()
    .from(homeItems)
    .where(and(eq(homeItems.id, id), eq(homeItems.userId, user.id)))
    .limit(1);
  if (!row) return;
  await db
    .update(homeItems)
    .set({
      name,
      location: String(formData.get("location") ?? "").trim(),
      quantity: Number(formData.get("quantity") ?? 1) || 1,
      r2Key: extraKey ?? row.r2Key,
      updatedAt: new Date(),
    })
    .where(and(eq(homeItems.id, id), eq(homeItems.userId, user.id)));
  refresh();
}

export async function deleteHomeItem(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const db = getDb();
  const [row] = await db
    .select()
    .from(homeItems)
    .where(and(eq(homeItems.id, id), eq(homeItems.userId, user.id)))
    .limit(1);
  if (row?.r2Key) await deletePrivateObject(row.r2Key);
  await db.delete(homeItems).where(and(eq(homeItems.id, id), eq(homeItems.userId, user.id)));
  refresh();
}

export async function createShopping(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await getDb().insert(shoppingItems).values({
    id: crypto.randomUUID(),
    userId: user.id,
    name,
  });
  refresh();
}

export async function toggleShopping(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const bought = String(formData.get("bought")) === "1";
  await getDb()
    .update(shoppingItems)
    .set({ bought, updatedAt: new Date() })
    .where(and(eq(shoppingItems.id, id), eq(shoppingItems.userId, user.id)));
  refresh();
}

export async function deleteShopping(formData: FormData) {
  const user = await requireUser();
  await getDb()
    .delete(shoppingItems)
    .where(and(eq(shoppingItems.id, String(formData.get("id"))), eq(shoppingItems.userId, user.id)));
  refresh();
}

export async function createBill(formData: FormData) {
  const user = await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const satang = satangFromBahtInput(String(formData.get("amount") ?? "0")) ?? 0;
  await getDb().insert(homeBills).values({
    id: crypto.randomUUID(),
    userId: user.id,
    title,
    amountSatang: satang,
    dueOn: String(formData.get("dueOn") ?? "") || null,
  });
  refresh();
}

export async function toggleBill(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const paid = String(formData.get("paid")) === "1";
  await getDb()
    .update(homeBills)
    .set({ paid, updatedAt: new Date() })
    .where(and(eq(homeBills.id, id), eq(homeBills.userId, user.id)));
  refresh();
}

export async function deleteBill(formData: FormData) {
  const user = await requireUser();
  await getDb()
    .delete(homeBills)
    .where(and(eq(homeBills.id, String(formData.get("id"))), eq(homeBills.userId, user.id)));
  refresh();
}

export async function updateBill(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const satang = satangFromBahtInput(String(formData.get("amount") ?? "0")) ?? 0;
  await getDb()
    .update(homeBills)
    .set({
      title,
      amountSatang: satang,
      dueOn: String(formData.get("dueOn") ?? "") || null,
      updatedAt: new Date(),
    })
    .where(and(eq(homeBills.id, id), eq(homeBills.userId, user.id)));
  refresh();
}

export async function copyLastMonthBills() {
  const user = await requireUser();
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });
  const [y, m] = today.split("-").map(Number);
  const thisPrefix = `${y}-${String(m).padStart(2, "0")}`;
  const prev = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
  const db = getDb();
  const rows = await db.select().from(homeBills).where(eq(homeBills.userId, user.id));
  const thisMonthTitles = new Set(
    rows.filter((b) => b.dueOn && String(b.dueOn).startsWith(thisPrefix)).map((b) => b.title),
  );
  const lastMonth = rows.filter((b) => b.dueOn && String(b.dueOn).startsWith(prev));
  for (const bill of lastMonth) {
    if (thisMonthTitles.has(bill.title)) continue;
    const day = String(bill.dueOn).slice(8, 10);
    await db.insert(homeBills).values({
      id: crypto.randomUUID(),
      userId: user.id,
      title: bill.title,
      amountSatang: bill.amountSatang,
      dueOn: `${thisPrefix}-${day}`,
      paid: false,
    });
    thisMonthTitles.add(bill.title);
  }
  refresh();
}
