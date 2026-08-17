import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import {
  huntCompareSets,
  huntFamilyPicks,
  huntPriceNotes,
  huntProjects,
  huntVisitPhotos,
  huntVisits,
  huntVotes,
  user,
} from "@/lib/db/schema";
import { seedPriceNotes, seedRows } from "./seed";

export async function ensureHuntSeeded() {
  const db = getDb();
  const existing = await db.select({ id: huntProjects.id }).from(huntProjects).limit(1);
  if (existing.length) return;
  const rows = seedRows();
  if (!rows.length) return;
  await db.insert(huntProjects).values(rows);
  await db.insert(huntPriceNotes).values(seedPriceNotes());
}

export async function listHuntProjects() {
  return getDb().select().from(huntProjects).orderBy(asc(huntProjects.rank));
}

export async function getHuntProject(id: string) {
  const [row] = await getDb().select().from(huntProjects).where(eq(huntProjects.id, id)).limit(1);
  return row ?? null;
}

export async function listPriceNotes(projectId: string) {
  return getDb().select().from(huntPriceNotes).where(eq(huntPriceNotes.projectId, projectId));
}

export async function listFamilyPicks(familyId: string) {
  return getDb().select().from(huntFamilyPicks).where(eq(huntFamilyPicks.familyId, familyId));
}

export async function getPick(familyId: string, projectId: string) {
  const [row] = await getDb()
    .select()
    .from(huntFamilyPicks)
    .where(and(eq(huntFamilyPicks.familyId, familyId), eq(huntFamilyPicks.projectId, projectId)))
    .limit(1);
  return row ?? null;
}

export async function listVotes(familyId: string, projectId?: string) {
  const db = getDb();
  if (projectId) {
    return db
      .select({
        id: huntVotes.id,
        projectId: huntVotes.projectId,
        userId: huntVotes.userId,
        score: huntVotes.score,
        name: user.name,
      })
      .from(huntVotes)
      .innerJoin(user, eq(user.id, huntVotes.userId))
      .where(and(eq(huntVotes.familyId, familyId), eq(huntVotes.projectId, projectId)));
  }
  return db
    .select({
      id: huntVotes.id,
      projectId: huntVotes.projectId,
      userId: huntVotes.userId,
      score: huntVotes.score,
      name: user.name,
    })
    .from(huntVotes)
    .innerJoin(user, eq(user.id, huntVotes.userId))
    .where(eq(huntVotes.familyId, familyId));
}

export async function getCompareIds(familyId: string) {
  const [row] = await getDb()
    .select()
    .from(huntCompareSets)
    .where(eq(huntCompareSets.familyId, familyId))
    .limit(1);
  return (row?.projectIds ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function listProjectsByIds(ids: string[]) {
  if (!ids.length) return [];
  const rows = await getDb().select().from(huntProjects).where(inArray(huntProjects.id, ids));
  const order = new Map(ids.map((id, i) => [id, i]));
  return rows.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}

export async function listVisits(familyId: string) {
  return getDb()
    .select({
      id: huntVisits.id,
      projectId: huntVisits.projectId,
      visitedOn: huntVisits.visitedOn,
      startsAt: huntVisits.startsAt,
      place: huntVisits.place,
      summary: huntVisits.summary,
      createdBy: huntVisits.createdBy,
      projectName: huntProjects.name,
    })
    .from(huntVisits)
    .innerJoin(huntProjects, eq(huntProjects.id, huntVisits.projectId))
    .where(eq(huntVisits.familyId, familyId))
    .orderBy(desc(huntVisits.visitedOn), desc(huntVisits.createdAt));
}

export async function listVisitPhotos(visitIds: string[]) {
  if (!visitIds.length) return [];
  return getDb().select().from(huntVisitPhotos).where(inArray(huntVisitPhotos.visitId, visitIds));
}
