import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { env } from "@/lib/env";

export async function GET() {
  const r2 = env.r2Configured;
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, db: false, r2 }, { status: 503 });
  }
  try {
    await getDb().execute(sql`select 1`);
    return NextResponse.json({ ok: true, db: true, r2 });
  } catch {
    return NextResponse.json({ ok: false, db: false, r2 }, { status: 500 });
  }
}
