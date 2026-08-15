import { and, asc, count, desc, eq, gt, isNull, lt, ne } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import {
  families,
  familyChannelReads,
  familyAppointments,
  familyChores,
  familyLocationShares,
  familyMembers,
  familyMessages,
  familyShoppingItems,
  user,
} from "@/lib/db/schema";

export async function getMembership(userId: string) {
  const db = getDb();
  const [row] = await db
    .select({
      familyId: familyMembers.familyId,
      role: familyMembers.role,
      name: families.name,
      joinCode: families.joinCode,
      joinCodeExpiresAt: families.joinCodeExpiresAt,
      createdBy: families.createdBy,
    })
    .from(familyMembers)
    .innerJoin(families, eq(families.id, familyMembers.familyId))
    .where(eq(familyMembers.userId, userId))
    .limit(1);
  return row ?? null;
}

export async function listMembers(familyId: string) {
  return getDb()
    .select({
      userId: familyMembers.userId,
      role: familyMembers.role,
      name: user.name,
      email: user.email,
    })
    .from(familyMembers)
    .innerJoin(user, eq(user.id, familyMembers.userId))
    .where(eq(familyMembers.familyId, familyId));
}

function mapMessage(x: {
  id: string;
  senderId: string;
  body: string;
  imageR2Key: string | null;
  deletedAt: Date | null;
  createdAt: Date;
}) {
  return {
    id: x.id,
    senderId: x.senderId,
    body: x.deletedAt ? "" : x.body,
    imageR2Key: x.deletedAt ? null : x.imageR2Key,
    deletedAt: x.deletedAt,
    createdAt: x.createdAt,
  };
}

export async function listMessages(familyId: string, channel: string, limit = 40) {
  const rows = await getDb()
    .select({
      id: familyMessages.id,
      senderId: familyMessages.senderId,
      body: familyMessages.body,
      imageR2Key: familyMessages.imageR2Key,
      deletedAt: familyMessages.deletedAt,
      createdAt: familyMessages.createdAt,
    })
    .from(familyMessages)
    .where(and(eq(familyMessages.familyId, familyId), eq(familyMessages.channel, channel)))
    .orderBy(desc(familyMessages.createdAt))
    .limit(limit);
  return rows.reverse().map(mapMessage);
}

export async function listMessagesBefore(
  familyId: string,
  channel: string,
  before: Date,
  limit = 40,
) {
  const rows = await getDb()
    .select({
      id: familyMessages.id,
      senderId: familyMessages.senderId,
      body: familyMessages.body,
      imageR2Key: familyMessages.imageR2Key,
      deletedAt: familyMessages.deletedAt,
      createdAt: familyMessages.createdAt,
    })
    .from(familyMessages)
    .where(
      and(
        eq(familyMessages.familyId, familyId),
        eq(familyMessages.channel, channel),
        lt(familyMessages.createdAt, before),
      ),
    )
    .orderBy(desc(familyMessages.createdAt))
    .limit(limit);
  return rows.reverse().map(mapMessage);
}

export async function countUnread(familyId: string, userId: string, channel: string) {
  const db = getDb();
  const [read] = await db
    .select({ lastReadAt: familyChannelReads.lastReadAt })
    .from(familyChannelReads)
    .where(
      and(
        eq(familyChannelReads.familyId, familyId),
        eq(familyChannelReads.userId, userId),
        eq(familyChannelReads.channel, channel),
      ),
    )
    .limit(1);
  const since = read?.lastReadAt ?? new Date(0);
  const [row] = await db
    .select({ n: count() })
    .from(familyMessages)
    .where(
      and(
        eq(familyMessages.familyId, familyId),
        eq(familyMessages.channel, channel),
        gt(familyMessages.createdAt, since),
        isNull(familyMessages.deletedAt),
        ne(familyMessages.senderId, userId),
      ),
    );
  return Number(row?.n ?? 0);
}

export async function markChannelRead(familyId: string, userId: string, channel: string) {
  const db = getDb();
  const now = new Date();
  const [existing] = await db
    .select({ id: familyChannelReads.id })
    .from(familyChannelReads)
    .where(
      and(
        eq(familyChannelReads.familyId, familyId),
        eq(familyChannelReads.userId, userId),
        eq(familyChannelReads.channel, channel),
      ),
    )
    .limit(1);
  if (existing) {
    await db
      .update(familyChannelReads)
      .set({ lastReadAt: now })
      .where(eq(familyChannelReads.id, existing.id));
  } else {
    await db.insert(familyChannelReads).values({
      id: crypto.randomUUID(),
      familyId,
      userId,
      channel,
      lastReadAt: now,
    });
  }
}

export async function listLiveLocations(familyId: string) {
  return getDb()
    .select({
      userId: familyLocationShares.userId,
      name: user.name,
      lat: familyLocationShares.lat,
      lng: familyLocationShares.lng,
      expiresAt: familyLocationShares.expiresAt,
      updatedAt: familyLocationShares.updatedAt,
    })
    .from(familyLocationShares)
    .innerJoin(user, eq(user.id, familyLocationShares.userId))
    .where(
      and(eq(familyLocationShares.familyId, familyId), gt(familyLocationShares.expiresAt, new Date())),
    );
}

export async function findFamilyByCode(code: string) {
  const [row] = await getDb()
    .select({
      id: families.id,
      name: families.name,
      joinCodeExpiresAt: families.joinCodeExpiresAt,
    })
    .from(families)
    .where(eq(families.joinCode, code.trim().toUpperCase()))
    .limit(1);
  return row ?? null;
}

export async function listFamilyShopping(familyId: string) {
  return getDb()
    .select({
      id: familyShoppingItems.id,
      name: familyShoppingItems.name,
      bought: familyShoppingItems.bought,
      shopOn: familyShoppingItems.shopOn,
      assigneeId: familyShoppingItems.assigneeId,
      createdAt: familyShoppingItems.createdAt,
    })
    .from(familyShoppingItems)
    .where(eq(familyShoppingItems.familyId, familyId))
    .orderBy(asc(familyShoppingItems.bought), desc(familyShoppingItems.createdAt));
}

export async function listFamilyChores(familyId: string) {
  return getDb()
    .select({
      id: familyChores.id,
      title: familyChores.title,
      dueOn: familyChores.dueOn,
      done: familyChores.done,
      assigneeId: familyChores.assigneeId,
      createdAt: familyChores.createdAt,
    })
    .from(familyChores)
    .where(eq(familyChores.familyId, familyId))
    .orderBy(asc(familyChores.done), desc(familyChores.createdAt));
}

export async function listFamilyAppointments(familyId: string) {
  return getDb()
    .select({
      id: familyAppointments.id,
      title: familyAppointments.title,
      startsAt: familyAppointments.startsAt,
      endsAt: familyAppointments.endsAt,
      place: familyAppointments.place,
      assigneeId: familyAppointments.assigneeId,
    })
    .from(familyAppointments)
    .where(eq(familyAppointments.familyId, familyId))
    .orderBy(asc(familyAppointments.startsAt));
}

export function inviteExpiryFromNow(days = 7) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
