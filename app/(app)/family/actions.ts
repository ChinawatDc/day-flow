"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db/client";
import {
  families,
  familyAppointments,
  familyChores,
  familyLocationShares,
  familyMembers,
  familyMessages,
  familyShoppingItems,
} from "@/lib/db/schema";
import { env } from "@/lib/env";
import { ablyDm, ablyGeo, ablyGroup, dmChannel, newJoinCode, publishFamily } from "@/lib/family/channels";
import {
  countUnread,
  findFamilyByCode,
  getMembership,
  inviteExpiryFromNow,
  listFamilyAppointments,
  listFamilyChores,
  listFamilyShopping,
  listLiveLocations,
  listMessages,
  listMessagesBefore,
  markChannelRead,
} from "@/lib/family/data";
import { uploadPrivateObject } from "@/lib/r2/client";
import { requireUser } from "@/lib/session";


function normalizeCode(raw: string) {
  const u = raw.trim().toUpperCase().replace(/\s+/g, "");
  if (/^PAN[A-Z0-9]{4}$/.test(u)) return `PAN-${u.slice(3)}`;
  return u;
}

function refreshFamily(peerId?: string) {
  revalidatePath("/family");
  if (peerId) revalidatePath(`/family/dm/${peerId}`);
}

async function requireMember(userId: string) {
  const m = await getMembership(userId);
  if (!m) redirect("/family");
  return m;
}

async function requireOwner(userId: string) {
  const m = await requireMember(userId);
  if (m.role !== "owner") redirect("/family");
  return m;
}

async function mintJoinCode() {
  let joinCode = newJoinCode();
  for (let i = 0; i < 5; i++) {
    const exists = await findFamilyByCode(joinCode);
    if (!exists) return joinCode;
    joinCode = newJoinCode();
  }
  return joinCode;
}

function serializeMsg(x: {
  id: string;
  senderId: string;
  body: string;
  imageR2Key?: string | null;
  deletedAt?: Date | string | null;
  createdAt: Date | string;
}) {
  return {
    id: x.id,
    senderId: x.senderId,
    body: x.deletedAt ? "" : x.body,
    imageR2Key: x.deletedAt ? null : (x.imageR2Key ?? null),
    deletedAt: x.deletedAt
      ? x.deletedAt instanceof Date
        ? x.deletedAt.toISOString()
        : String(x.deletedAt)
      : null,
    createdAt: x.createdAt instanceof Date ? x.createdAt.toISOString() : String(x.createdAt),
  };
}

export async function createFamily(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim() || "บ้านเรา";
  if (await getMembership(user.id)) redirect("/family");
  const db = getDb();
  const joinCode = await mintJoinCode();
  const id = crypto.randomUUID();
  await db.insert(families).values({
    id,
    name,
    joinCode,
    joinCodeExpiresAt: inviteExpiryFromNow(7),
    createdBy: user.id,
  });
  await db.insert(familyMembers).values({
    id: crypto.randomUUID(),
    familyId: id,
    userId: user.id,
    role: "owner",
  });
  refreshFamily();
  redirect("/family");
}

export async function renameFamily(formData: FormData) {
  const user = await requireUser();
  const m = await requireOwner(user.id);
  const name = String(formData.get("name") ?? "").trim().slice(0, 80);
  if (!name) return;
  await getDb().update(families).set({ name }).where(eq(families.id, m.familyId));
  refreshFamily();
}

export async function joinFamilyByCode(raw: string) {
  const user = await requireUser();
  if (await getMembership(user.id)) redirect("/family");
  const code = normalizeCode(raw);
  const family = await findFamilyByCode(code);
  if (!family) redirect(`/family?err=${encodeURIComponent("ไม่พบโค้ดนี้")}`);
  if (family.joinCodeExpiresAt && new Date(family.joinCodeExpiresAt).getTime() <= Date.now()) {
    redirect(`/family?err=${encodeURIComponent("โค้ดหมดอายุแล้ว")}`);
  }
  await getDb().insert(familyMembers).values({
    id: crypto.randomUUID(),
    familyId: family.id,
    userId: user.id,
    role: "member",
  });
  refreshFamily();
  redirect("/family");
}

export async function joinFamily(formData: FormData) {
  return joinFamilyByCode(String(formData.get("code") ?? ""));
}

export async function rotateJoinCode() {
  const user = await requireUser();
  const m = await requireOwner(user.id);
  const joinCode = await mintJoinCode();
  await getDb()
    .update(families)
    .set({ joinCode, joinCodeExpiresAt: inviteExpiryFromNow(7) })
    .where(eq(families.id, m.familyId));
  refreshFamily();
}

export async function transferOwnership(formData: FormData) {
  const user = await requireUser();
  const m = await requireOwner(user.id);
  const nextOwnerId = String(formData.get("userId") ?? "");
  if (!nextOwnerId || nextOwnerId === user.id) return;
  const db = getDb();
  const [target] = await db
    .select({ id: familyMembers.id })
    .from(familyMembers)
    .where(and(eq(familyMembers.familyId, m.familyId), eq(familyMembers.userId, nextOwnerId)))
    .limit(1);
  if (!target) return;
  await db
    .update(familyMembers)
    .set({ role: "member" })
    .where(and(eq(familyMembers.familyId, m.familyId), eq(familyMembers.userId, user.id)));
  await db
    .update(familyMembers)
    .set({ role: "owner" })
    .where(and(eq(familyMembers.familyId, m.familyId), eq(familyMembers.userId, nextOwnerId)));
  refreshFamily();
}

export async function leaveFamily(formData?: FormData) {
  const user = await requireUser();
  const m = await getMembership(user.id);
  if (!m) redirect("/family");
  const db = getDb();
  const members = await db
    .select({ userId: familyMembers.userId, role: familyMembers.role })
    .from(familyMembers)
    .where(eq(familyMembers.familyId, m.familyId));

  if (m.role === "owner" && members.length > 1) {
    const newOwnerId = String(formData?.get("newOwnerId") ?? "");
    if (!newOwnerId || newOwnerId === user.id) {
      redirect(`/family?err=${encodeURIComponent("โอนเจ้าของก่อนออกจากบ้าน")}`);
    }
    const ok = members.some((x) => x.userId === newOwnerId);
    if (!ok) redirect(`/family?err=${encodeURIComponent("ไม่พบสมาชิกที่จะโอน")}`);
    await db
      .update(familyMembers)
      .set({ role: "owner" })
      .where(and(eq(familyMembers.familyId, m.familyId), eq(familyMembers.userId, newOwnerId)));
  }

  await db
    .delete(familyMembers)
    .where(and(eq(familyMembers.familyId, m.familyId), eq(familyMembers.userId, user.id)));

  const leftover = await db
    .select({ id: familyMembers.id })
    .from(familyMembers)
    .where(eq(familyMembers.familyId, m.familyId));
  if (leftover.length === 0) {
    await db.delete(families).where(eq(families.id, m.familyId));
  }
  refreshFamily();
  redirect("/family");
}

export async function removeMember(formData: FormData) {
  const user = await requireUser();
  const m = await requireOwner(user.id);
  const userId = String(formData.get("userId") ?? "");
  if (!userId || userId === user.id) return;
  await getDb()
    .delete(familyMembers)
    .where(and(eq(familyMembers.familyId, m.familyId), eq(familyMembers.userId, userId)));
  refreshFamily();
}

async function uploadChatImage(userId: string, familyId: string, file: File | null) {
  if (!file || file.size === 0) return null;
  if (!env.r2Configured) return null;
  if (!file.type.startsWith("image/")) return null;
  if (file.size > 8 * 1024 * 1024) return null;
  try {
    const safe = file.name.replace(/[^\w.\-ก-๙]+/g, "_") || "image.jpg";
    const key = `family/${familyId}/chat/${userId}/${Date.now()}-${safe}`;
    const buf = Buffer.from(await file.arrayBuffer());
    await uploadPrivateObject(key, buf, file.type || "image/jpeg");
    return key;
  } catch (err) {
    console.error("family chat upload failed", err);
    return null;
  }
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
  const file = formData.get("image");
  const imageR2Key = await uploadChatImage(
    user.id,
    m.familyId,
    file instanceof File ? file : null,
  );
  if (!body && !imageR2Key) return;
  const id = crypto.randomUUID();
  const createdAt = new Date();
  await getDb().insert(familyMessages).values({
    id,
    familyId: m.familyId,
    channel,
    senderId: user.id,
    body: body || (imageR2Key ? "รูป" : ""),
    imageR2Key,
  });
  const payload = serializeMsg({
    id,
    senderId: user.id,
    body: body || (imageR2Key ? "รูป" : ""),
    imageR2Key,
    deletedAt: null,
    createdAt,
  });
  if (channel === "group") {
    await publishFamily(ablyGroup(m.familyId), "message", payload);
  } else if (peerId) {
    await publishFamily(ablyDm(m.familyId, user.id, peerId), "message", payload);
  }
  await markChannelRead(m.familyId, user.id, channel);
  refreshFamily(peerId);
}

export async function deleteOwnMessage(formData: FormData) {
  const user = await requireUser();
  const m = await requireMember(user.id);
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const db = getDb();
  const [row] = await db
    .select({
      id: familyMessages.id,
      channel: familyMessages.channel,
      senderId: familyMessages.senderId,
      createdAt: familyMessages.createdAt,
    })
    .from(familyMessages)
    .where(and(eq(familyMessages.id, id), eq(familyMessages.familyId, m.familyId)))
    .limit(1);
  if (!row || row.senderId !== user.id) return;
  const deletedAt = new Date();
  await db.update(familyMessages).set({ deletedAt }).where(eq(familyMessages.id, id));
  const peerParts = row.channel.includes(":") ? row.channel.split(":") : null;
  const peerId = peerParts?.find((p) => p !== user.id);
  await publishFamily(
    row.channel === "group" ? ablyGroup(m.familyId) : ablyDm(m.familyId, user.id, peerId ?? user.id),
    "message",
    serializeMsg({
      id,
      senderId: user.id,
      body: "",
      imageR2Key: null,
      deletedAt,
      createdAt: row.createdAt,
    }),
  );
  refreshFamily(peerId);
}

export async function markFamilyChannelRead(channel: string) {
  const user = await requireUser();
  const m = await getMembership(user.id);
  if (!m || !channel) return;
  await markChannelRead(m.familyId, user.id, channel);
}

export async function loadOlderGroupMessages(beforeIso: string) {
  const user = await requireUser();
  const m = await getMembership(user.id);
  if (!m) return [];
  const before = new Date(beforeIso);
  if (Number.isNaN(before.getTime())) return [];
  const rows = await listMessagesBefore(m.familyId, "group", before);
  return rows.map(serializeMsg);
}

export async function loadOlderDmMessages(peerId: string, beforeIso: string) {
  const user = await requireUser();
  const m = await getMembership(user.id);
  if (!m || !peerId) return [];
  const before = new Date(beforeIso);
  if (Number.isNaN(before.getTime())) return [];
  const rows = await listMessagesBefore(m.familyId, dmChannel(user.id, peerId), before);
  return rows.map(serializeMsg);
}

function parseShareDurationMinutes(raw: FormData | string) {
  const value = typeof raw === "string" ? raw : String(raw.get("minutes") ?? "60");
  if (value === "0" || value === "until") return 0; // until stop → 12h hard cap
  const n = Number(value);
  if (n === 15 || n === 60 || n === 180) return n;
  return 60;
}

function expiresFromMinutes(minutes: number) {
  if (minutes <= 0) return new Date(Date.now() + 12 * 60 * 60 * 1000);
  return new Date(Date.now() + minutes * 60 * 1000);
}

export async function startLocationShare(formData?: FormData) {
  const user = await requireUser();
  const m = await requireMember(user.id);
  const minutes = parseShareDurationMinutes(formData ?? new FormData());
  const expiresAt = expiresFromMinutes(minutes);
  const db = getDb();
  const [existing] = await db
    .select({ id: familyLocationShares.id, lat: familyLocationShares.lat, lng: familyLocationShares.lng })
    .from(familyLocationShares)
    .where(and(eq(familyLocationShares.familyId, m.familyId), eq(familyLocationShares.userId, user.id)))
    .limit(1);
  if (existing) {
    await db
      .update(familyLocationShares)
      .set({ expiresAt, updatedAt: new Date() })
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
    lat: existing?.lat ?? "",
    lng: existing?.lng ?? "",
  });
  refreshFamily();
}

export async function extendLocationShare(formData: FormData) {
  const user = await requireUser();
  const m = await requireMember(user.id);
  const add = parseShareDurationMinutes(formData);
  const db = getDb();
  const [row] = await db
    .select({
      id: familyLocationShares.id,
      expiresAt: familyLocationShares.expiresAt,
      lat: familyLocationShares.lat,
      lng: familyLocationShares.lng,
    })
    .from(familyLocationShares)
    .where(and(eq(familyLocationShares.familyId, m.familyId), eq(familyLocationShares.userId, user.id)))
    .limit(1);
  if (!row) return;
  const base = Math.max(new Date(row.expiresAt).getTime(), Date.now());
  const extraMs = (add <= 0 ? 60 : add) * 60 * 1000;
  const expiresAt = new Date(base + extraMs);
  await db
    .update(familyLocationShares)
    .set({ expiresAt, updatedAt: new Date() })
    .where(eq(familyLocationShares.id, row.id));
  await publishFamily(ablyGeo(m.familyId), "share", {
    userId: user.id,
    expiresAt: expiresAt.toISOString(),
    lat: row.lat,
    lng: row.lng,
  });
  refreshFamily();
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
  refreshFamily();
}

export async function stopMemberLocationShare(formData: FormData) {
  const user = await requireUser();
  const m = await requireOwner(user.id);
  const userId = String(formData.get("userId") ?? "");
  if (!userId) return;
  await getDb()
    .delete(familyLocationShares)
    .where(and(eq(familyLocationShares.familyId, m.familyId), eq(familyLocationShares.userId, userId)));
  await publishFamily(ablyGeo(m.familyId), "stop", { userId });
  refreshFamily();
}

export async function pollGroupMessages() {
  const user = await requireUser();
  const m = await getMembership(user.id);
  if (!m) return [];
  const rows = await listMessages(m.familyId, "group");
  return rows.map(serializeMsg);
}

export async function pollDmMessages(peerId: string) {
  const user = await requireUser();
  const m = await getMembership(user.id);
  if (!m || !peerId) return [];
  const rows = await listMessages(m.familyId, dmChannel(user.id, peerId));
  return rows.map(serializeMsg);
}

export async function pollLiveLocations() {
  const user = await requireUser();
  const m = await getMembership(user.id);
  if (!m) return [];
  const rows = await listLiveLocations(m.familyId);
  return rows.map((l) => ({
    userId: l.userId,
    name: l.name,
    lat: l.lat,
    lng: l.lng,
    expiresAt: new Date(l.expiresAt).toISOString(),
  }));
}

export async function getGroupUnreadCount() {
  const user = await requireUser();
  const m = await getMembership(user.id);
  if (!m) return 0;
  return countUnread(m.familyId, user.id, "group");
}

/* —— Shared ops: shopping —— */

export async function createFamilyShopping(formData: FormData) {
  const user = await requireUser();
  const m = await requireMember(user.id);
  const name = String(formData.get("name") ?? "").trim().slice(0, 120);
  if (!name) return;
  const assigneeId = String(formData.get("assigneeId") ?? "") || null;
  const shopOn = String(formData.get("shopOn") ?? "") || null;
  await getDb().insert(familyShoppingItems).values({
    id: crypto.randomUUID(),
    familyId: m.familyId,
    name,
    shopOn,
    assigneeId,
    createdBy: user.id,
  });
  refreshFamily();
}

export async function toggleFamilyShopping(formData: FormData) {
  const user = await requireUser();
  const m = await requireMember(user.id);
  const id = String(formData.get("id") ?? "");
  const bought = String(formData.get("bought")) === "1";
  if (!id) return;
  await getDb()
    .update(familyShoppingItems)
    .set({ bought, updatedAt: new Date() })
    .where(and(eq(familyShoppingItems.id, id), eq(familyShoppingItems.familyId, m.familyId)));
  refreshFamily();
}

export async function deleteFamilyShopping(formData: FormData) {
  const user = await requireUser();
  const m = await requireMember(user.id);
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await getDb()
    .delete(familyShoppingItems)
    .where(and(eq(familyShoppingItems.id, id), eq(familyShoppingItems.familyId, m.familyId)));
  refreshFamily();
}

export async function createFamilyChore(formData: FormData) {
  const user = await requireUser();
  const m = await requireMember(user.id);
  const title = String(formData.get("title") ?? "").trim().slice(0, 120);
  if (!title) return;
  const dueOn = String(formData.get("dueOn") ?? "") || null;
  const assigneeId = String(formData.get("assigneeId") ?? "") || null;
  await getDb().insert(familyChores).values({
    id: crypto.randomUUID(),
    familyId: m.familyId,
    title,
    dueOn,
    assigneeId,
    createdBy: user.id,
  });
  refreshFamily();
}

export async function toggleFamilyChore(formData: FormData) {
  const user = await requireUser();
  const m = await requireMember(user.id);
  const id = String(formData.get("id") ?? "");
  const done = String(formData.get("done")) === "1";
  if (!id) return;
  await getDb()
    .update(familyChores)
    .set({ done, updatedAt: new Date() })
    .where(and(eq(familyChores.id, id), eq(familyChores.familyId, m.familyId)));
  refreshFamily();
}

export async function deleteFamilyChore(formData: FormData) {
  const user = await requireUser();
  const m = await requireMember(user.id);
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await getDb()
    .delete(familyChores)
    .where(and(eq(familyChores.id, id), eq(familyChores.familyId, m.familyId)));
  refreshFamily();
}

export async function pollFamilyShopping() {
  const user = await requireUser();
  const m = await getMembership(user.id);
  if (!m) return [];
  return listFamilyShopping(m.familyId);
}

export async function pollFamilyChores() {
  const user = await requireUser();
  const m = await getMembership(user.id);
  if (!m) return [];
  return listFamilyChores(m.familyId);
}

function bangkokDateTime(raw: string) {
  const t = raw.trim();
  if (!t) return null;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(t)) {
    const base = t.length === 16 ? `${t}:00` : t.slice(0, 19);
    return new Date(`${base}+07:00`);
  }
  return new Date(t);
}

export async function createFamilyAppointment(formData: FormData) {
  const user = await requireUser();
  const m = await requireMember(user.id);
  const title = String(formData.get("title") ?? "").trim().slice(0, 120);
  const startsAt = bangkokDateTime(String(formData.get("startsAt") ?? ""));
  if (!title || !startsAt || Number.isNaN(startsAt.getTime())) return;
  const endsRaw = String(formData.get("endsAt") ?? "");
  const endsAt = endsRaw ? bangkokDateTime(endsRaw) : null;
  const place = String(formData.get("place") ?? "").trim().slice(0, 160);
  const assigneeId = String(formData.get("assigneeId") ?? "") || null;
  await getDb().insert(familyAppointments).values({
    id: crypto.randomUUID(),
    familyId: m.familyId,
    title,
    startsAt,
    endsAt: endsAt && !Number.isNaN(endsAt.getTime()) ? endsAt : null,
    place,
    assigneeId,
    createdBy: user.id,
  });
  refreshFamily();
}

export async function deleteFamilyAppointment(formData: FormData) {
  const user = await requireUser();
  const m = await requireMember(user.id);
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await getDb()
    .delete(familyAppointments)
    .where(and(eq(familyAppointments.id, id), eq(familyAppointments.familyId, m.familyId)));
  refreshFamily();
}

export async function pollFamilyAppointments() {
  const user = await requireUser();
  const m = await getMembership(user.id);
  if (!m) return [];
  const rows = await listFamilyAppointments(m.familyId);
  return rows.map((a) => ({
    ...a,
    startsAt: new Date(a.startsAt).toISOString(),
    endsAt: a.endsAt ? new Date(a.endsAt).toISOString() : null,
  }));
}
