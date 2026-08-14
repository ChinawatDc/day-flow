import { and, desc, eq, gte, isNull, lte, or } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import {
  captures,
  expenses,
  homeBills,
  homeItems,
  journalEntries,
  journalPhotos,
  shoppingItems,
  tasks,
  vaultItems,
} from "@/lib/db/schema";
import { addDaysIso, bangkokTodayIso } from "@/lib/utils";

export async function getTodaySnapshot(userId: string) {
  const db = getDb();
  const today = bangkokTodayIso();
  const soon = addDaysIso(today, 30);

  const [openTasks, dayExpenses, unfiled, journal, expiring] = await Promise.all([
    db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          isNull(tasks.doneAt),
          or(eq(tasks.dueOn, today), isNull(tasks.dueOn)),
        ),
      )
      .orderBy(tasks.dueOn),
    db
      .select()
      .from(expenses)
      .where(and(eq(expenses.userId, userId), eq(expenses.spentOn, today))),
    db
      .select()
      .from(captures)
      .where(and(eq(captures.userId, userId), eq(captures.kind, "unfiled")))
      .orderBy(desc(captures.createdAt)),
    db
      .select()
      .from(journalEntries)
      .where(and(eq(journalEntries.userId, userId), eq(journalEntries.entryOn, today)))
      .limit(1),
    db
      .select()
      .from(vaultItems)
      .where(
        and(
          eq(vaultItems.userId, userId),
          gte(vaultItems.expiresOn, today),
          lte(vaultItems.expiresOn, soon),
        ),
      ),
  ]);

  const spentToday = dayExpenses.reduce((s, e) => s + e.amountSatang, 0);
  return {
    today,
    openTasks,
    spentToday,
    unfiledCount: unfiled.length,
    unfiled,
    hasJournal: journal.length > 0,
    expiring,
  };
}

export async function listCaptures(userId: string) {
  return getDb()
    .select()
    .from(captures)
    .where(eq(captures.userId, userId))
    .orderBy(desc(captures.createdAt));
}

export async function listTasks(userId: string) {
  return getDb()
    .select()
    .from(tasks)
    .where(eq(tasks.userId, userId))
    .orderBy(desc(tasks.createdAt));
}

export async function listExpenses(userId: string) {
  return getDb()
    .select()
    .from(expenses)
    .where(eq(expenses.userId, userId))
    .orderBy(desc(expenses.spentOn), desc(expenses.createdAt));
}

export async function monthExpenseTotal(userId: string, dayIso: string) {
  const prefix = dayIso.slice(0, 7);
  const rows = await listExpenses(userId);
  return rows
    .filter((e) => e.spentOn.startsWith(prefix))
    .reduce((s, e) => s + e.amountSatang, 0);
}

export async function listVault(userId: string) {
  return getDb()
    .select()
    .from(vaultItems)
    .where(eq(vaultItems.userId, userId))
    .orderBy(desc(vaultItems.createdAt));
}

export async function listHome(userId: string) {
  const db = getDb();
  const [items, shopping, bills] = await Promise.all([
    db.select().from(homeItems).where(eq(homeItems.userId, userId)).orderBy(desc(homeItems.createdAt)),
    db.select().from(shoppingItems).where(eq(shoppingItems.userId, userId)).orderBy(desc(shoppingItems.createdAt)),
    db.select().from(homeBills).where(eq(homeBills.userId, userId)).orderBy(desc(homeBills.createdAt)),
  ]);
  return { items, shopping, bills };
}

export async function getJournal(userId: string, entryOn: string) {
  const db = getDb();
  const [entry] = await db
    .select()
    .from(journalEntries)
    .where(and(eq(journalEntries.userId, userId), eq(journalEntries.entryOn, entryOn)))
    .limit(1);
  if (!entry) return { entry: null, photos: [] };
  const photos = await db
    .select()
    .from(journalPhotos)
    .where(eq(journalPhotos.entryId, entry.id));
  return { entry, photos };
}
