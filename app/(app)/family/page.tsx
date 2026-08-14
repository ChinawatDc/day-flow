import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { FamilyChat } from "@/components/family/family-chat";
import { GeoShare } from "@/components/family/geo-share";
import { InviteQr } from "@/components/family/invite-qr";
import { JoinPanel } from "@/components/family/join-panel";
import { ChapterTabs } from "@/components/notebook/chapter-tabs";
import { ConfirmDelete } from "@/components/notebook/confirm-delete";
import { RecordRow } from "@/components/notebook/record-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createFamily,
  leaveFamily,
  removeMember,
  rotateJoinCode,
  sendGroupMessage,
} from "./actions";
import { env } from "@/lib/env";
import { ablyGeo, ablyGroup } from "@/lib/family/channels";
import { getMembership, listLiveLocations, listMembers, listMessages } from "@/lib/family/data";
import { requireUser } from "@/lib/session";

export default async function FamilyPage() {
  const user = await requireUser();
  const m = await getMembership(user.id);
  if (!m) {
    return (
      <AppShell title="ครอบครัว">
        <p className="text-caption mb-4">สร้างบ้านใหม่ หรือเข้าร่วมด้วยโค้ด / QR</p>
        <div className="grid gap-8">
          <form action={createFamily} className="grid gap-3">
            <Label htmlFor="name">ชื่อครอบครัว</Label>
            <Input id="name" name="name" placeholder="บ้านเรา" />
            <Button type="submit">สร้างครอบครัว</Button>
          </form>
          <JoinPanel />
        </div>
      </AppShell>
    );
  }

  const [members, messages, locations] = await Promise.all([
    listMembers(m.familyId),
    listMessages(m.familyId, "group"),
    listLiveLocations(m.familyId),
  ]);
  const names = Object.fromEntries(members.map((p) => [p.userId, p.name || p.email]));
  const joinUrl = `${env.appUrl}/family/join?code=${encodeURIComponent(m.joinCode)}`;
  const myShare = locations.find((l) => l.userId === user.id);
  const live = env.ablyConfigured;

  return (
    <AppShell title="ครอบครัว">
      <ChapterTabs labels={["บ้าน", "กลุ่ม", "คน", "โลเคชัน"]}>
        <div className="grid gap-4">
          <p className="text-title">{m.name}</p>
          <p className="text-caption">สมาชิก {members.length} คน</p>
          {m.role === "owner" ? (
            <div className="rounded-xl border border-line p-4">
              <p className="text-caption mb-2">โค้ดเชิญ</p>
              <p className="text-title mb-3 tracking-wide">{m.joinCode}</p>
              <InviteQr url={joinUrl} />
              <p className="text-caption mt-2 break-all">{joinUrl}</p>
              <form action={rotateJoinCode} className="mt-3">
                <Button type="submit" variant="outline" size="sm">
                  หมุนโค้ดใหม่
                </Button>
              </form>
            </div>
          ) : (
            <p className="text-caption">ให้เจ้าของบ้านส่ง QR หรือโค้ด</p>
          )}
          <ul className="grid gap-2">
            {members.map((p) => (
              <RecordRow
                key={p.userId}
                title={p.name || p.email}
                hint={p.role === "owner" ? "เจ้าของ" : "สมาชิก"}
                actions={
                  m.role === "owner" && p.userId !== user.id ? (
                    <ConfirmDelete action={removeMember} id={p.userId} name="userId" label="เอาออก" message="เอาออกจากบ้าน?" />
                  ) : null
                }
              />
            ))}
          </ul>
          <form action={leaveFamily}>
            <Button type="submit" variant="outline">
              ออกจากครอบครัว
            </Button>
          </form>
        </div>
        <FamilyChat
          channelName={ablyGroup(m.familyId)}
          live={live}
          meId={user.id}
          names={names}
          initial={messages.map((x) => ({
            id: x.id,
            senderId: x.senderId,
            body: x.body,
            createdAt: x.createdAt,
          }))}
          action={sendGroupMessage}
        />
        <ul className="grid gap-2">
          {members
            .filter((p) => p.userId !== user.id)
            .map((p) => (
              <RecordRow
                key={p.userId}
                title={p.name || p.email}
                actions={
                  <Link href={`/family/dm/${p.userId}`} className="text-sm text-kaffir">
                    แชท
                  </Link>
                }
              />
            ))}
        </ul>
        <GeoShare
          channelName={ablyGeo(m.familyId)}
          live={live}
          meId={user.id}
          names={names}
          sharingUntil={myShare ? new Date(myShare.expiresAt).toISOString() : null}
          initial={locations.map((l) => ({
            userId: l.userId,
            name: l.name,
            lat: l.lat,
            lng: l.lng,
            expiresAt: new Date(l.expiresAt).toISOString(),
          }))}
        />
      </ChapterTabs>
    </AppShell>
  );
}
