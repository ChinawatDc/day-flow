import { getDb } from "@/lib/db/client";
import { session } from "@/lib/db/schema";

export const SESSION_COOKIE = "better-auth.session_token";

export async function insertAppSession(userId: string) {
  const token = `${crypto.randomUUID().replaceAll("-", "")}${crypto.randomUUID().replaceAll("-", "")}`;
  const expiresAt = new Date(Date.now() + 60 * 60 * 24 * 60 * 1000);
  await getDb().insert(session).values({
    id: crypto.randomUUID(),
    token,
    userId,
    expiresAt,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return { token, expiresAt };
}

export function sessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
  };
}
