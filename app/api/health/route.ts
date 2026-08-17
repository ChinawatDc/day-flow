import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { env } from "@/lib/env";

export async function GET() {
  const r2 = env.r2Configured;
  const authEnv = Boolean(
    process.env.BETTER_AUTH_SECRET &&
      (process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL),
  );
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, db: false, r2, authEnv }, { status: 503 });
  }
  try {
    await getDb().execute(sql`select 1`);
    return NextResponse.json({ ok: true, db: true, r2, authEnv, lineLogin: env.lineLoginConfigured, lineOa: env.lineOaConfigured });
  } catch {
    return NextResponse.json({ ok: false, db: false, r2, authEnv }, { status: 500 });
  }
}
