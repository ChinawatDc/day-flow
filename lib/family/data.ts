import { and, desc, eq, gt } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import {
  families,
  familyLocationShares,
  familyMembers,
  familyMessages,
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

export async function listMessages(familyId: string, channel: string, limit = 80) {
  const rows = await getDb()
    .select({
      id: familyMessages.id,
      senderId: familyMessages.senderId,
      body: familyMessages.body,
      createdAt: familyMessages.createdAt,
    })
    .from(familyMessages)
    .where(and(eq(familyMessages.familyId, familyId), eq(familyMessages.channel, channel)))
    .orderBy(desc(familyMessages.createdAt))
    .limit(limit);
  return rows.reverse();
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
    .select({ id: families.id, name: families.name })
    .from(families)
    .where(eq(families.joinCode, code.trim().toUpperCase()))
    .limit(1);
  return row ?? null;
}
