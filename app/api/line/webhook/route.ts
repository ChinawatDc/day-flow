import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { user } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { getMembership } from "@/lib/family/data";
import { listFamilyPicks, listHuntProjects } from "@/lib/hunt/data";
import { huntFlex, huntMenuMessages, replyLine, verifyLineSignature } from "@/lib/line/oa";
import { huntPostbackPath } from "@/lib/line/richmenu";

type LineEvent = {
  type: string;
  replyToken?: string;
  postback?: { data?: string };
  message?: { type?: string; text?: string };
  source?: { userId?: string };
};

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const sig = req.headers.get("x-line-signature");
  if (!verifyLineSignature(raw, sig)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }
  if (!env.lineOaConfigured) return NextResponse.json({ ok: true });
  let body: { events?: LineEvent[] };
  try {
    body = JSON.parse(raw) as { events?: LineEvent[] };
  } catch {
    return NextResponse.json({ ok: true });
  }
  for (const ev of body.events ?? []) {
    if (!ev.replyToken) continue;
    const lineUserId = ev.source?.userId;
    if (ev.type === "follow") {
      await replyLine(ev.replyToken, huntMenuMessages());
      continue;
    }
    const text = ev.message?.type === "text" ? ev.message.text?.trim() ?? "" : "";
    const postback = ev.postback?.data ?? "";
    const intent = postback || text;
    if (/เลือกบ้าน|ตาราง|hunt:open/i.test(intent)) {
      await replyLine(ev.replyToken, [huntFlex("เลือกบ้าน", "ตารางโครงการของบ้านคุณ", "/family/hunt")]);
      continue;
    }
    if (/เทียบ|hunt:compare/i.test(intent)) {
      await replyLine(ev.replyToken, [huntFlex("เทียบบ้าน", "ชุดที่บ้านเลือกไว้", "/family/hunt/compare")]);
      continue;
    }
    if (/นัดดู|hunt:visits/i.test(intent)) {
      await replyLine(ev.replyToken, [huntFlex("นัดดูบ้าน", "นัดและรูปที่ไปดู", "/family/hunt/visits")]);
      continue;
    }
    if (/shortlist|เก็บ/i.test(intent) || postback === "hunt:shortlist") {
      const names = await shortlistNames(lineUserId);
      await replyLine(ev.replyToken, [
        huntFlex("shortlist", names || "ยังไม่มีรายการ — เปิดแอปแล้วกดเก็บ", "/family/hunt/shortlist"),
      ]);
      continue;
    }
    if (postback) {
      await replyLine(ev.replyToken, [huntFlex("เลือกบ้าน", "เปิดจากเมนู", huntPostbackPath(postback))]);
    }
  }
  return NextResponse.json({ ok: true });
}

async function shortlistNames(lineUserId?: string) {
  if (!lineUserId) return "";
  const db = getDb();
  const [row] = await db.select().from(user).where(eq(user.lineUserId, lineUserId)).limit(1);
  if (!row) return "เชื่อม LINE ในตั้งค่าแอปก่อน";
  const m = await getMembership(row.id);
  if (!m) return "เข้าครอบครัวในแอปก่อน";
  const [picks, projects] = await Promise.all([listFamilyPicks(m.familyId), listHuntProjects()]);
  const ids = new Set(picks.filter((p) => p.shortlisted).map((p) => p.projectId));
  return projects
    .filter((p) => ids.has(p.id))
    .map((p) => p.name)
    .join(" · ");
}
