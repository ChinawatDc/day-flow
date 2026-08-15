import { NextRequest, NextResponse } from "next/server";
import { getPresignedGetUrl } from "@/lib/r2/client";
import { getMembership } from "@/lib/family/data";
import { requireUser } from "@/lib/session";
import { env } from "@/lib/env";

export async function GET(req: NextRequest) {
  const user = await requireUser();
  const key = req.nextUrl.searchParams.get("key");
  if (!key) return NextResponse.json({ error: "missing key" }, { status: 400 });

  const own = key.startsWith(`${user.id}/`);
  const familyMatch = key.match(/^family\/([^/]+)\//);
  if (!own && !familyMatch) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (familyMatch) {
    const m = await getMembership(user.id);
    if (!m || m.familyId !== familyMatch[1]) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  }

  if (!env.r2Configured) {
    return NextResponse.json({ error: "R2 is not configured" }, { status: 501 });
  }
  const url = await getPresignedGetUrl(key, 300);
  return NextResponse.redirect(url);
}
