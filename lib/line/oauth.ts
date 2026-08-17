import { createHmac, timingSafeEqual } from "crypto";
import { env } from "@/lib/env";

export type LineProfile = {
  userId: string;
  displayName: string;
  pictureUrl?: string;
};

export function lineAuthorizeUrl(state: string, redirectUri: string) {
  const q = new URLSearchParams({
    response_type: "code",
    client_id: env.lineLoginChannelId,
    redirect_uri: redirectUri,
    state,
    scope: "profile openid",
  });
  return `https://access.line.me/oauth2/v2.1/authorize?${q}`;
}

export function lineCallbackUri() {
  return `${env.appUrl}/api/line/callback`;
}

export function signLineState(payload: string) {
  const sig = createHmac("sha256", env.betterAuthSecret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyLineState(state: string) {
  const i = state.lastIndexOf(".");
  if (i < 1) return null;
  const payload = state.slice(0, i);
  const sig = state.slice(i + 1);
  const expect = createHmac("sha256", env.betterAuthSecret).update(payload).digest("hex");
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expect))) return null;
  } catch {
    return null;
  }
  return payload;
}

export async function exchangeLineCode(code: string) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: lineCallbackUri(),
    client_id: env.lineLoginChannelId,
    client_secret: env.lineLoginChannelSecret,
  });
  const res = await fetch("https://api.line.me/oauth2/v2.1/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error(`LINE token ${res.status}`);
  return (await res.json()) as { access_token: string };
}

export async function fetchLineProfile(accessToken: string): Promise<LineProfile> {
  const res = await fetch("https://api.line.me/v2/profile", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`LINE profile ${res.status}`);
  const p = (await res.json()) as { userId: string; displayName: string; pictureUrl?: string };
  return { userId: p.userId, displayName: p.displayName, pictureUrl: p.pictureUrl };
}
