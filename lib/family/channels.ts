import { env } from "@/lib/env";

export function newJoinCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let body = "";
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  for (const b of bytes) body += alphabet[b % alphabet.length];
  return `PAN-${body}`;
}

export function dmChannel(a: string, b: string) {
  return [a, b].sort((x, y) => x.localeCompare(y)).join(":");
}

export function ablyGroup(familyId: string) {
  return `family:${familyId}:group`;
}

export function ablyDm(familyId: string, a: string, b: string) {
  return `family:${familyId}:dm:${dmChannel(a, b)}`;
}

export function ablyGeo(familyId: string) {
  return `family:${familyId}:geo`;
}

export async function publishFamily(channel: string, name: string, data: object) {
  if (!env.ablyConfigured) return;
  const Ably = (await import("ably")).default;
  const rest = new Ably.Rest({ key: env.ablyApiKey });
  await rest.channels.get(channel).publish(name, data);
}
