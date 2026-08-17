import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { user } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { exchangeLineCode, fetchLineProfile, verifyLineState } from "@/lib/line/oauth";
import { insertAppSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/line/session";
import { getSession } from "@/lib/session";
import { safeNextPath } from "@/lib/safe-path";

type StatePayload = { n: string; next: string; link: boolean; uid: string | null };

export async function GET(req: NextRequest) {
  const err = (q: string) => NextResponse.redirect(new URL(`/login?err=${q}`, env.appUrl));
  if (!env.lineLoginConfigured) return err("line");
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const cookieState = req.cookies.get("line_oauth_state")?.value;
  if (!code || !state || !cookieState || state !== cookieState) return err("line");
  const raw = verifyLineState(state);
  if (!raw) return err("line");
  let parsed: StatePayload;
  try {
    parsed = JSON.parse(raw) as StatePayload;
  } catch {
    return err("line");
  }
  const next = safeNextPath(parsed.next);

  try {
    const token = await exchangeLineCode(code);
    const profile = await fetchLineProfile(token.access_token);
    const db = getDb();
    const email = `line.${profile.userId}@dayflow.local`;
    const [byLine] = await db.select().from(user).where(eq(user.lineUserId, profile.userId)).limit(1);

    if (parsed.link) {
      const session = await getSession();
      if (!session?.user || session.user.id !== parsed.uid) {
        return NextResponse.redirect(new URL("/settings?err=line", env.appUrl));
      }
      if (byLine && byLine.id !== session.user.id) {
        return NextResponse.redirect(new URL("/settings?err=lineused", env.appUrl));
      }
      await db
        .update(user)
        .set({ lineUserId: profile.userId, updatedAt: new Date() })
        .where(eq(user.id, session.user.id));
      const res = NextResponse.redirect(new URL("/settings", env.appUrl));
      res.cookies.delete("line_oauth_state");
      return res;
    }

    let userId = byLine?.id;
    if (!userId) {
      const [byEmail] = await db.select().from(user).where(eq(user.email, email)).limit(1);
      if (byEmail) {
        userId = byEmail.id;
        await db
          .update(user)
          .set({ lineUserId: profile.userId, updatedAt: new Date() })
          .where(eq(user.id, byEmail.id));
      } else {
        userId = crypto.randomUUID();
        await db.insert(user).values({
          id: userId,
          name: profile.displayName || "LINE",
          email,
          emailVerified: false,
          image: profile.pictureUrl ?? null,
          lineUserId: profile.userId,
        });
      }
    }
    const sess = await insertAppSession(userId);
    const res = NextResponse.redirect(new URL(next, env.appUrl));
    res.cookies.set(SESSION_COOKIE, sess.token, sessionCookieOptions(sess.expiresAt));
    res.cookies.delete("line_oauth_state");
    return res;
  } catch {
    return err("line");
  }
}
