import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { lineAuthorizeUrl, lineCallbackUri, signLineState } from "@/lib/line/oauth";
import { getSession } from "@/lib/session";
import { safeNextPath } from "@/lib/safe-path";

export async function GET(req: NextRequest) {
  if (!env.lineLoginConfigured) {
    return NextResponse.redirect(new URL("/login", env.appUrl));
  }
  const next = safeNextPath(req.nextUrl.searchParams.get("next"));
  const link = req.nextUrl.searchParams.get("link") === "1";
  const session = await getSession();
  if (link && !session?.user) {
    return NextResponse.redirect(new URL("/login", env.appUrl));
  }
  const payload = JSON.stringify({
    n: crypto.randomUUID(),
    next,
    link,
    uid: link ? session?.user.id : null,
  });
  const state = signLineState(payload);
  const url = lineAuthorizeUrl(state, lineCallbackUri());
  const res = NextResponse.redirect(url);
  res.cookies.set("line_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
