"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db/client";
import {
  families,
  familyLocationShares,
  familyMembers,
  familyMessages,
} from "@/lib/db/schema";
import { ablyDm, ablyGeo, ablyGroup, dmChannel, newJoinCode, publishFamily } from "@/lib/family/channels";
import { findFamilyByCode, getMembership } from "@/lib/family/data";
import { requireUser } from "@/lib/session";

function normalizeCode(raw: string) {
  const u = raw.trim().toUpperCase().replace(/\s+/g, "");
  if (/^PAN[A-Z0-9]{4}$/.test(u)) return `PAN-${u.slice(3)}`;
  return u;
}

async function requireMember(userId: string) {
  const m = await getMembership(userId);
  if (!m) redirect("/family");
  return m;
}

export async function createFamily(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim() || "บ้านเรา";
  if (await getMembership(user.id)) redirect("/family");
  const db = getDb();
  let joinCode = newJoinCode();
  for (let i = 0; i < 5; i++) {
    const exists = await findFamilyByCode(joinCode);
    if (!exists) break;
    joinCode = newJoinCode();
  }
  const id = crypto.randomUUID();
  await db.insert(families).values({ id, name, joinCode, createdBy: user.id });
  await db.insert(familyMembers).values({
    id: crypto.randomUUID(),
    familyId: id,
    userId: user.id,
    role: "owner",
  });
  revalidatePath("/family");
  redirect("/family");
}

export async function joinFamilyByCode(raw: string) {
  const user = await requireUser();
  if (await getMembership(user.id)) redirect("/family");
  const code = normalizeCode(raw);
  const family = await findFamilyByCode(code);
  if (!family) redirect(`/family?err=${encodeURIComponent("ไม่พบโค้ดนี้")}`);
  await getDb().insert(familyMembers).values({
    id: crypto.randomUUID(),
    familyId: family.id,
    userId: user.id,
    role: "member",
  });
  revalidatePath("/family");
  redirect("/family");
}

export async function joinFamily(formData: FormData) {
  return joinFamilyByCode(String(formData.get("code") ?? ""));
}

export async function rotateJoinCode() {
  const user = await requireUser();
  const m = await requireMember(user.id);
  if (m.role !== "owner") return;
  let joinCode = newJoinCode();
  for (let i = 0; i < 5; i++) {
    const exists = await findFamilyByCode(joinCode);
    if (!exists) break;
    joinCode = newJoinCode();
  }
  await getDb().update(families).set({ joinCode }).where(eq(families.id, m.familyId));
  revalidatePath("/family");
}

export async function leaveFamily() {
  const user = await requireUser();
  const m = await getMembership(user.id);
  if (!m) redirect("/family");
  const db = getDb();
  await db
    .delete(familyMembers)
    .where(and(eq(familyMembers.familyId, m.familyId), eq(familyMembers.userId, user.id)));
  const leftover = await db
    .select({ id: familyMembers.id, userId: familyMembers.userId })
    .from(familyMembers)
    .where(eq(familyMembers.familyId, m.familyId));
  if (leftover.length === 0) {
    await db.delete(families).where(eq(families.id, m.familyId));
  } else if (m.role === "owner") {
    await db
      .update(familyMembers)
      .set({ role: "owner" })
      .where(and(eq(familyMembers.familyId, m.familyId), eq(familyMembers.userId, leftover[0].userId)));
  }
  revalidatePath("/family");
  redirect("/family");
}

export async function removeMember(formData: FormData) {
  const user = await requireUser();
  const m = await requireMember(user.id);
  if (m.role !== "owner") return;
  const userId = String(formData.get("userId") ?? "");
  if (!userId || userId === user.id) return;
  await getDb()
    .delete(familyMembers)
    .where(and(eq(familyMembers.familyId, m.familyId), eq(familyMembers.userId, userId)));
  revalidatePath("/family");
}

export async function sendGroupMessage(formData: FormData) {
  await sendOnChannel(formData, "group");
}

export async function sendDmMessage(formData: FormData) {
  const peerId = String(formData.get("peerId") ?? "");
  const user = await requireUser();
  if (!peerId) return;
  await sendOnChannel(formData, dmChannel(user.id, peerId), peerId);
}

async function sendOnChannel(formData: FormData, channel: string, peerId?: string) {
  const user = await requireUser();
  const m = await requireMember(user.id);
  const body = String(formData.get("body") ?? "").trim().slice(0, 2000);
  if (!body) return;
  const id = crypto.randomUUID();
  const createdAt = new Date();
  await getDb().insert(familyMessages).values({
    id,
    familyId: m.familyId,
    channel,
    senderId: user.id,
    body,
  });
  const payload = { id, senderId: user.id, body, createdAt: createdAt.toISOString() };
  if (channel === "group") {
    await publishFamily(ablyGroup(m.familyId), "message", payload);
  } else if (peerId) {
    await publishFamily(ablyDm(m.familyId, user.id, peerId), "message", payload);
  }
  revalidatePath("/family");
  if (peerId) revalidatePath(`/family/dm/${peerId}`);
}

export async function startLocationShare() {
  const user = await requireUser();
  const m = await requireMember(user.id);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  const db = getDb();
  const [existing] = await db
    .select({ id: familyLocationShares.id })
    .from(familyLocationShares)
    .where(and(eq(familyLocationShares.familyId, m.familyId), eq(familyLocationShares.userId, user.id)))
    .limit(1);
  if (existing) {
    await db
      .update(familyLocationShares)
      .set({ expiresAt, updatedAt: new Date(), lat: "", lng: "" })
      .where(eq(familyLocationShares.id, existing.id));
  } else {
    await db.insert(familyLocationShares).values({
      id: crypto.randomUUID(),
      familyId: m.familyId,
      userId: user.id,
      expiresAt,
    });
  }
  await publishFamily(ablyGeo(m.familyId), "share", {
    userId: user.id,
    expiresAt: expiresAt.toISOString(),
    lat: "",
    lng: "",
  });
  revalidatePath("/family");
}

export async function pingLocation(formData: FormData) {
  const user = await requireUser();
  const m = await getMembership(user.id);
  if (!m) return;
  const lat = String(formData.get("lat") ?? "");
  const lng = String(formData.get("lng") ?? "");
  if (!lat || !lng) return;
  const db = getDb();
  const [row] = await db
    .select({ id: familyLocationShares.id, expiresAt: familyLocationShares.expiresAt })
    .from(familyLocationShares)
    .where(and(eq(familyLocationShares.familyId, m.familyId), eq(familyLocationShares.userId, user.id)))
    .limit(1);
  if (!row || new Date(row.expiresAt).getTime() <= Date.now()) return;
  await db
    .update(familyLocationShares)
    .set({ lat, lng, updatedAt: new Date() })
    .where(eq(familyLocationShares.id, row.id));
  await publishFamily(ablyGeo(m.familyId), "ping", {
    userId: user.id,
    lat,
    lng,
    expiresAt: row.expiresAt.toISOString(),
  });
}

export async function stopLocationShare() {
  const user = await requireUser();
  const m = await requireMember(user.id);
  await getDb()
    .delete(familyLocationShares)
    .where(and(eq(familyLocationShares.familyId, m.familyId), eq(familyLocationShares.userId, user.id)));
  await publishFamily(ablyGeo(m.familyId), "stop", { userId: user.id });
  revalidatePath("/family");
}
