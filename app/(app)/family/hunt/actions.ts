"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db/client";
import {
  familyAppointments,
  huntCompareSets,
  huntFamilyPicks,
  huntVisitPhotos,
  huntVisits,
  huntVotes,
} from "@/lib/db/schema";
import { requireHuntFamily } from "@/lib/hunt/access";
import { getCompareIds, getHuntProject } from "@/lib/hunt/data";
import { notifyFamilyHunt } from "@/lib/line/oa";
import { maybeUploadFamily } from "@/lib/upload";

function refreshHunt(slug?: string) {
  revalidatePath("/family/hunt");
  revalidatePath("/family/hunt/compare");
  revalidatePath("/family/hunt/shortlist");
  revalidatePath("/family/hunt/visits");
  revalidatePath("/family");
  if (slug) revalidatePath(`/family/hunt/${slug}`);
}

export async function toggleShortlist(formData: FormData) {
  const { user, familyId } = await requireHuntFamily();
  const projectId = String(formData.get("projectId") ?? "");
  const project = await getHuntProject(projectId);
  if (!project) return;
  const db = getDb();
  const [row] = await db
    .select()
    .from(huntFamilyPicks)
    .where(and(eq(huntFamilyPicks.familyId, familyId), eq(huntFamilyPicks.projectId, projectId)))
    .limit(1);
  const next = !row?.shortlisted;
  if (row) {
    await db
      .update(huntFamilyPicks)
      .set({ shortlisted: next, updatedBy: user.id, updatedAt: new Date() })
      .where(eq(huntFamilyPicks.id, row.id));
  } else {
    await db.insert(huntFamilyPicks).values({
      id: crypto.randomUUID(),
      familyId,
      projectId,
      shortlisted: true,
      note: "",
      updatedBy: user.id,
    });
  }
  if (next) {
    await notifyFamilyHunt(
      familyId,
      user.id,
      "shortlist",
      `${user.name || "คู่"} เก็บ ${project.name}`,
      `/family/hunt/${projectId}`,
    );
  }
  refreshHunt(projectId);
}

export async function saveHuntNote(formData: FormData) {
  const { user, familyId } = await requireHuntFamily();
  const projectId = String(formData.get("projectId") ?? "");
  const note = String(formData.get("note") ?? "").slice(0, 2000);
  if (!projectId) return;
  const db = getDb();
  const [row] = await db
    .select()
    .from(huntFamilyPicks)
    .where(and(eq(huntFamilyPicks.familyId, familyId), eq(huntFamilyPicks.projectId, projectId)))
    .limit(1);
  if (row) {
    await db
      .update(huntFamilyPicks)
      .set({ note, updatedBy: user.id, updatedAt: new Date() })
      .where(eq(huntFamilyPicks.id, row.id));
  } else {
    await db.insert(huntFamilyPicks).values({
      id: crypto.randomUUID(),
      familyId,
      projectId,
      shortlisted: false,
      note,
      updatedBy: user.id,
    });
  }
  refreshHunt(projectId);
}

export async function saveHuntVote(formData: FormData) {
  const { user, familyId } = await requireHuntFamily();
  const projectId = String(formData.get("projectId") ?? "");
  const score = Number(formData.get("score"));
  if (!projectId || !Number.isFinite(score) || score < 1 || score > 10) return;
  const db = getDb();
  const [row] = await db
    .select()
    .from(huntVotes)
    .where(
      and(eq(huntVotes.familyId, familyId), eq(huntVotes.projectId, projectId), eq(huntVotes.userId, user.id)),
    )
    .limit(1);
  if (row) {
    await db.update(huntVotes).set({ score, updatedAt: new Date() }).where(eq(huntVotes.id, row.id));
  } else {
    await db.insert(huntVotes).values({
      id: crypto.randomUUID(),
      familyId,
      projectId,
      userId: user.id,
      score,
    });
  }
  refreshHunt(projectId);
}

export async function toggleCompare(formData: FormData) {
  const { familyId } = await requireHuntFamily();
  const projectId = String(formData.get("projectId") ?? "");
  if (!projectId) return;
  const ids = await getCompareIds(familyId);
  const has = ids.includes(projectId);
  const next = has ? ids.filter((id) => id !== projectId) : [...ids, projectId].slice(-4);
  const db = getDb();
  const [row] = await db.select().from(huntCompareSets).where(eq(huntCompareSets.familyId, familyId)).limit(1);
  if (row) {
    await db
      .update(huntCompareSets)
      .set({ projectIds: next.join(","), updatedAt: new Date() })
      .where(eq(huntCompareSets.id, row.id));
  } else {
    await db.insert(huntCompareSets).values({
      id: crypto.randomUUID(),
      familyId,
      projectIds: next.join(","),
    });
  }
  refreshHunt(projectId);
}

export async function createHuntVisit(formData: FormData) {
  const { user, familyId } = await requireHuntFamily();
  const projectId = String(formData.get("projectId") ?? "");
  const project = await getHuntProject(projectId);
  const visitedOn = String(formData.get("visitedOn") ?? "").slice(0, 10);
  if (!project || !/^\d{4}-\d{2}-\d{2}$/.test(visitedOn)) return;
  const place = String(formData.get("place") ?? "").trim().slice(0, 160);
  const summary = String(formData.get("summary") ?? "").trim().slice(0, 2000);
  const startsRaw = String(formData.get("startsAt") ?? "").trim();
  let startsAt: Date | null = null;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(startsRaw)) {
    const base = startsRaw.length === 16 ? `${startsRaw}:00` : startsRaw.slice(0, 19);
    startsAt = new Date(`${base}+07:00`);
  }
  const db = getDb();
  let appointmentId: string | null = null;
  if (startsAt && !Number.isNaN(startsAt.getTime())) {
    appointmentId = crypto.randomUUID();
    await db.insert(familyAppointments).values({
      id: appointmentId,
      familyId,
      title: `ดูบ้าน ${project.name}`,
      startsAt,
      place: place || project.zone,
      createdBy: user.id,
    });
  }
  const visitId = crypto.randomUUID();
  await db.insert(huntVisits).values({
    id: visitId,
    familyId,
    projectId,
    visitedOn,
    startsAt,
    place: place || project.zone,
    summary,
    appointmentId,
    createdBy: user.id,
  });
  const file = formData.get("file");
  const key = await maybeUploadFamily(familyId, `hunt/${projectId}`, file instanceof File ? file : null);
  if (key) {
    await db.insert(huntVisitPhotos).values({
      id: crypto.randomUUID(),
      visitId,
      r2Key: key,
    });
  }
  await notifyFamilyHunt(
    familyId,
    user.id,
    "นัดดูบ้าน",
    `${user.name || "คู่"} เพิ่มนัด ${project.name}`,
    "/family/hunt/visits",
  );
  refreshHunt(projectId);
}
