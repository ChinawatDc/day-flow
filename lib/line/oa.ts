import { createHmac, timingSafeEqual } from "crypto";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { user } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { listMembers } from "@/lib/family/data";

type LineMessage =
  | { type: "text"; text: string }
  | {
      type: "flex";
      altText: string;
      contents: Record<string, unknown>;
    };

export function verifyLineSignature(rawBody: string, signature: string | null) {
  if (!signature || !env.lineOaSecret) return false;
  const mac = createHmac("sha256", env.lineOaSecret).update(rawBody).digest("base64");
  try {
    return timingSafeEqual(Buffer.from(mac), Buffer.from(signature));
  } catch {
    return false;
  }
}

async function pushTo(lineUserId: string, messages: LineMessage[]) {
  if (!env.lineOaConfigured) return;
  await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.lineOaToken}`,
    },
    body: JSON.stringify({ to: lineUserId, messages }),
  });
}

export async function replyLine(replyToken: string, messages: LineMessage[]) {
  if (!env.lineOaConfigured) return;
  await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.lineOaToken}`,
    },
    body: JSON.stringify({ replyToken, messages }),
  });
}

export function huntFlex(title: string, body: string, path: string) {
  const url = `${env.appUrl}${path}`;
  return {
    type: "flex" as const,
    altText: title,
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          { type: "text", text: title, weight: "bold", size: "lg", wrap: true },
          { type: "text", text: body, size: "sm", wrap: true, color: "#666666" },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            style: "primary",
            color: "#C9A227",
            action: { type: "uri", label: "เปิดในแอป", uri: url },
          },
        ],
      },
    },
  };
}

export async function notifyFamilyHunt(
  familyId: string,
  exceptUserId: string,
  title: string,
  body: string,
  path: string,
) {
  if (!env.lineOaConfigured) return;
  const members = await listMembers(familyId);
  const others = members.filter((m) => m.userId !== exceptUserId);
  if (!others.length) return;
  const db = getDb();
  const flex = huntFlex(title, body, path);
  for (const m of others) {
    const [row] = await db
      .select({ lineUserId: user.lineUserId })
      .from(user)
      .where(eq(user.id, m.userId))
      .limit(1);
    if (row?.lineUserId) await pushTo(row.lineUserId, [flex]);
  }
}

export function huntMenuMessages() {
  const base = env.appUrl;
  return [
    huntFlex("เลือกบ้าน", "ตารางโครงการและราคาเริ่มต้น", "/family/hunt"),
    {
      type: "text" as const,
      text: `shortlist ${base}/family/hunt/shortlist\nเทียบ ${base}/family/hunt/compare\nนัดดู ${base}/family/hunt/visits`,
    },
  ];
}
