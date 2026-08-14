import { NextResponse } from "next/server";
import Ably from "ably";
import { env } from "@/lib/env";
import { getMembership } from "@/lib/family/data";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "auth" }, { status: 401 });
  }
  if (!env.ablyConfigured) {
    return NextResponse.json({ error: "ably" }, { status: 503 });
  }
  const m = await getMembership(session.user.id);
  if (!m) {
    return NextResponse.json({ error: "family" }, { status: 403 });
  }
  const rest = new Ably.Rest({ key: env.ablyApiKey });
  const tokenRequest = await rest.auth.createTokenRequest({
    clientId: session.user.id,
    capability: {
      [`family:${m.familyId}:*`]: ["subscribe"],
    },
  });
  return NextResponse.json(tokenRequest);
}
