import { and, count, desc, eq, gte, ilike, isNull, lt, lte, or } from "drizzle-orm";
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
import { expenseCategories } from "@/lib/modules";

export async function getTodaySnapshot(userId: string) {
  const db = getDb();
  const today = bangkokTodayIso();
  const soon = addDaysIso(today, 30);
  const staleBefore = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const monthPrefix = today.slice(0, 7);

  const [
    todayTasks,
    overdueTasks,
    dayExpenses,
    unfiledN,
    staleN,
    journal,
    expiring,
    unpaidBills,
  ] = await Promise.all([
    db
      .select({ id: tasks.id, title: tasks.title, dueOn: tasks.dueOn })
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
      .select({ id: tasks.id, title: tasks.title, dueOn: tasks.dueOn })
      .from(tasks)
      .where(and(eq(tasks.userId, userId), isNull(tasks.doneAt), lt(tasks.dueOn, today)))
      .orderBy(tasks.dueOn),
    db
      .select({ amountSatang: expenses.amountSatang })
      .from(expenses)
      .where(and(eq(expenses.userId, userId), eq(expenses.spentOn, today))),
    db
      .select({ n: count() })
      .from(captures)
      .where(and(eq(captures.userId, userId), eq(captures.kind, "unfiled"))),
    db
      .select({ n: count() })
      .from(captures)
      .where(
        and(
          eq(captures.userId, userId),
          eq(captures.kind, "unfiled"),
          lt(captures.createdAt, staleBefore),
        ),
      ),
    db
      .select({ id: journalEntries.id })
      .from(journalEntries)
      .where(and(eq(journalEntries.userId, userId), eq(journalEntries.entryOn, today)))
      .limit(1),
    db
      .select({ id: vaultItems.id, title: vaultItems.title, expiresOn: vaultItems.expiresOn })
      .from(vaultItems)
      .where(
        and(
          eq(vaultItems.userId, userId),
          gte(vaultItems.expiresOn, today),
          lte(vaultItems.expiresOn, soon),
        ),
      ),
    db
      .select({
        id: homeBills.id,
        title: homeBills.title,
        dueOn: homeBills.dueOn,
        amountSatang: homeBills.amountSatang,
        paid: homeBills.paid,
      })
      .from(homeBills)
      .where(and(eq(homeBills.userId, userId), eq(homeBills.paid, false))),
  ]);

  const spentToday = dayExpenses.reduce((s, e) => s + e.amountSatang, 0);
  const billsThisMonth = unpaidBills.filter((b) => !b.dueOn || String(b.dueOn).startsWith(monthPrefix));
  return {
    today,
    todayTasks,
    overdueTasks,
    spentToday,
    unfiledCount: Number(unfiledN[0]?.n ?? 0),
    staleCount: Number(staleN[0]?.n ?? 0),
    hasJournal: journal.length > 0,
    expiring,
    billsThisMonth,
  };
}

export async function listCaptures(userId: string) {
  return getDb()
    .select()
    .from(captures)
    .where(eq(captures.userId, userId))
    .orderBy(desc(captures.createdAt));
}

export async function listUnfiledCaptures(userId: string) {
  return getDb()
    .select({ id: captures.id, note: captures.note, r2Key: captures.r2Key })
    .from(captures)
    .where(and(eq(captures.userId, userId), eq(captures.kind, "unfiled")))
    .orderBy(desc(captures.createdAt));
}

const taskListCols = {
  id: tasks.id,
  title: tasks.title,
  note: tasks.note,
  dueOn: tasks.dueOn,
  doneAt: tasks.doneAt,
};

export async function listTasks(userId: string, filter: string = "all", today?: string) {
  const db = getDb();
  const day = today ?? bangkokTodayIso();
  if (filter === "today") {
    return db
      .select(taskListCols)
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.dueOn, day), isNull(tasks.doneAt)))
      .orderBy(desc(tasks.createdAt));
  }
  if (filter === "open") {
    return db
      .select(taskListCols)
      .from(tasks)
      .where(and(eq(tasks.userId, userId), isNull(tasks.doneAt)))
      .orderBy(desc(tasks.createdAt));
  }
  return db.select(taskListCols).from(tasks).where(eq(tasks.userId, userId)).orderBy(desc(tasks.createdAt));
}

export async function listExpenses(userId: string) {
  return getDb()
    .select({
      id: expenses.id,
      amountSatang: expenses.amountSatang,
      category: expenses.category,
      merchant: expenses.merchant,
      spentOn: expenses.spentOn,
      receiptR2Key: expenses.receiptR2Key,
    })
    .from(expenses)
    .where(eq(expenses.userId, userId))
    .orderBy(desc(expenses.spentOn), desc(expenses.createdAt));
}

export async function monthExpenseTotal(userId: string, dayIso: string) {
  const byCat = await monthExpensesByCategory(userId, dayIso);
  return byCat.reduce((s, c) => s + c.total, 0);
}

export function monthSummaryFromRows(
  rows: { spentOn: string; category: string; amountSatang: number }[],
  dayIso: string,
) {
  const prefix = dayIso.slice(0, 7);
  const map = new Map<string, number>();
  for (const e of rows) {
    if (!String(e.spentOn).startsWith(prefix)) continue;
    map.set(e.category, (map.get(e.category) ?? 0) + e.amountSatang);
  }
  return expenseCategories.map((c) => ({
    id: c.id,
    label: c.label,
    total: map.get(c.id) ?? 0,
  }));
}

export async function monthExpensesByCategory(userId: string, dayIso: string) {
  const rows = await listExpenses(userId);
  return monthSummaryFromRows(rows, dayIso);
}

export async function listVault(
  userId: string,
  soon?: { soonAfter: string; soonBefore: string },
) {
  const db = getDb();
  const cols = {
    id: vaultItems.id,
    title: vaultItems.title,
    kind: vaultItems.kind,
    expiresOn: vaultItems.expiresOn,
    r2Key: vaultItems.r2Key,
  };
  if (soon) {
    return db
      .select(cols)
      .from(vaultItems)
      .where(
        and(
          eq(vaultItems.userId, userId),
          gte(vaultItems.expiresOn, soon.soonAfter),
          lte(vaultItems.expiresOn, soon.soonBefore),
        ),
      )
      .orderBy(desc(vaultItems.createdAt));
  }
  return db.select(cols).from(vaultItems).where(eq(vaultItems.userId, userId)).orderBy(desc(vaultItems.createdAt));
}

export async function listHome(userId: string) {
  const db = getDb();
  const [items, shopping, bills] = await Promise.all([
    db
      .select({
        id: homeItems.id,
        name: homeItems.name,
        location: homeItems.location,
        quantity: homeItems.quantity,
        r2Key: homeItems.r2Key,
      })
      .from(homeItems)
      .where(eq(homeItems.userId, userId))
      .orderBy(desc(homeItems.createdAt)),
    db
      .select({ id: shoppingItems.id, name: shoppingItems.name, bought: shoppingItems.bought })
      .from(shoppingItems)
      .where(eq(shoppingItems.userId, userId))
      .orderBy(desc(shoppingItems.createdAt)),
    db
      .select({
        id: homeBills.id,
        title: homeBills.title,
        amountSatang: homeBills.amountSatang,
        dueOn: homeBills.dueOn,
        paid: homeBills.paid,
      })
      .from(homeBills)
      .where(eq(homeBills.userId, userId))
      .orderBy(desc(homeBills.createdAt)),
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

export async function searchNotebook(userId: string, q: string) {
  const needle = `%${q.trim()}%`;
  if (q.trim().length < 1) {
    return { tasks: [], expenses: [], vault: [], captures: [] };
  }
  const db = getDb();
  const [taskRows, expenseRows, vaultRows, captureRows] = await Promise.all([
    db
      .select({ id: tasks.id, title: tasks.title })
      .from(tasks)
      .where(and(eq(tasks.userId, userId), or(ilike(tasks.title, needle), ilike(tasks.note, needle))))
      .limit(20),
    db
      .select({ id: expenses.id, merchant: expenses.merchant, amountSatang: expenses.amountSatang })
      .from(expenses)
      .where(and(eq(expenses.userId, userId), or(ilike(expenses.merchant, needle), ilike(expenses.category, needle))))
      .limit(20),
    db
      .select({ id: vaultItems.id, title: vaultItems.title })
      .from(vaultItems)
      .where(and(eq(vaultItems.userId, userId), ilike(vaultItems.title, needle)))
      .limit(20),
    db
      .select({ id: captures.id, note: captures.note })
      .from(captures)
      .where(
        and(
          eq(captures.userId, userId),
          eq(captures.kind, "unfiled"),
          ilike(captures.note, needle),
        ),
      )
      .limit(20),
  ]);
  return { tasks: taskRows, expenses: expenseRows, vault: vaultRows, captures: captureRows };
}

export async function exportUserData(userId: string) {
  const db = getDb();
  const [taskRows, expenseRows, vaultRows, captureRows, homeItemsRows, shopping, bills, journal] =
    await Promise.all([
      db.select().from(tasks).where(eq(tasks.userId, userId)),
      db.select().from(expenses).where(eq(expenses.userId, userId)),
      db.select().from(vaultItems).where(eq(vaultItems.userId, userId)),
      db.select().from(captures).where(eq(captures.userId, userId)),
      db.select().from(homeItems).where(eq(homeItems.userId, userId)),
      db.select().from(shoppingItems).where(eq(shoppingItems.userId, userId)),
      db.select().from(homeBills).where(eq(homeBills.userId, userId)),
      db.select().from(journalEntries).where(eq(journalEntries.userId, userId)),
    ]);
  return {
    exportedAt: new Date().toISOString(),
    tasks: taskRows,
    expenses: expenseRows,
    vault: vaultRows,
    captures: captureRows,
    homeItems: homeItemsRows,
    shopping,
    bills,
    journal,
  };
}
