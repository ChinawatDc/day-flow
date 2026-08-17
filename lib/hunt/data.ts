import { and, asc, desc, eq, inArray, notInArray, sql } from "drizzle-orm";
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
  const rows = seedRows();
  if (!rows.length) return;
  await db
    .insert(huntProjects)
    .values(rows)
    .onConflictDoUpdate({
      target: huntProjects.id,
      set: {
        name: sql`excluded.name`,
        developer: sql`excluded.developer`,
        zone: sql`excluded.zone`,
        houseType: sql`excluded.house_type`,
        hasDetached: sql`excluded.has_detached`,
        hasTwin: sql`excluded.has_twin`,
        priceStartSatang: sql`excluded.price_start_satang`,
        priceMaxSatang: sql`excluded.price_max_satang`,
        priceNote: sql`excluded.price_note`,
        landNote: sql`excluded.land_note`,
        landWahTenths: sql`excluded.land_wah_tenths`,
        usableSqmMin: sql`excluded.usable_sqm_min`,
        usableSqmMax: sql`excluded.usable_sqm_max`,
        bedrooms: sql`excluded.bedrooms`,
        bathrooms: sql`excluded.bathrooms`,
        parking: sql`excluded.parking`,
        fitScore: sql`excluded.fit_score`,
        valueScore: sql`excluded.value_score`,
        rank: sql`excluded.rank`,
        commuteNote: sql`excluded.commute_note`,
        sizeNote: sql`excluded.size_note`,
        caveat: sql`excluded.caveat`,
        lat: sql`excluded.lat`,
        lng: sql`excluded.lng`,
        traffic: sql`excluded.traffic`,
        hospitalNote: sql`excluded.hospital_note`,
        mallNote: sql`excluded.mall_note`,
        highwayNote: sql`excluded.highway_note`,
        schoolNote: sql`excluded.school_note`,
        pros: sql`excluded.pros`,
        cons: sql`excluded.cons`,
        budgetUnder6: sql`excluded.budget_under_6`,
        unitCheck: sql`excluded.unit_check`,
      },
    });
  const ids = rows.map((r) => r.id);
  await db.delete(huntProjects).where(notInArray(huntProjects.id, ids));
  const notes = seedPriceNotes();
  if (notes.length) {
    await db.delete(huntPriceNotes);
    await db.insert(huntPriceNotes).values(notes);
  }
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
