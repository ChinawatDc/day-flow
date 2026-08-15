import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { GroupChatLive } from "@/components/family/chat-live";
import { GeoShare } from "@/components/family/geo-share";
import { InviteQr } from "@/components/family/invite-qr";
import { ChapterTabs } from "@/components/notebook/chapter-tabs";
import { ConfirmDelete } from "@/components/notebook/confirm-delete";
import { OverviewCard } from "@/components/notebook/overview-card";
import { RecordRow, SoftTag } from "@/components/notebook/record-row";
import { Button } from "@/components/ui/button";
import { leaveFamily, removeMember, rotateJoinCode } from "./actions";
import { env } from "@/lib/env";
import { ablyGeo, ablyGroup } from "@/lib/family/channels";
import { listLiveLocations, listMembers, listMessages } from "@/lib/family/data";

export async function FamilyHome({
  userId,
  familyId,
  name,
  joinCode,
  role,
}: {
  userId: string;
  familyId: string;
  name: string;
  joinCode: string;
  role: string;
}) {
  const [members, messages, locations] = await Promise.all([
    listMembers(familyId),
    listMessages(familyId, "group"),
    listLiveLocations(familyId),
  ]);
  const names = Object.fromEntries(members.map((p) => [p.userId, p.name || p.email]));
  const joinUrl = `${env.appUrl}/family/join?code=${encodeURIComponent(joinCode)}`;
  const myShare = locations.find((l) => l.userId === userId);
  const live = env.ablyConfigured;

  return (
    <AppShell title="ครอบครัว" subtitle={name}>
      <div className="mb-5 grid grid-cols-2 gap-3">
        <OverviewCard tone="kaffir" title="สมาชิก" value={String(members.length)} />
        <OverviewCard title="กำลังแชร์โลเคชัน" value={String(locations.length)} />
      </div>
      <ChapterTabs labels={["บ้าน", "กลุ่ม", "คน", "โลเคชัน"]}>
        <div className="grid gap-4">
          {role === "owner" ? (
            <div className="df-card p-4">
              <p className="text-caption mb-2">โค้ดเชิญ</p>
              <p className="text-title mb-3 tracking-wide">{joinCode}</p>
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
          <ul className="grid gap-3">
            {members.map((p) => (
              <RecordRow
                key={p.userId}
                title={p.name || p.email}
                tag={<SoftTag tone={p.role === "owner" ? "kaffir" : "muted"}>{p.role === "owner" ? "เจ้าของ" : "สมาชิก"}</SoftTag>}
                actions={
                  role === "owner" && p.userId !== userId ? (
                    <ConfirmDelete
                      action={removeMember}
                      id={p.userId}
                      name="userId"
                      label="เอาออก"
                      message="เอาออกจากบ้าน?"
                    />
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
        <GroupChatLive
          channelName={ablyGroup(familyId)}
          live={live}
          meId={userId}
          names={names}
          initial={messages.map((x) => ({
            id: x.id,
            senderId: x.senderId,
            body: x.body,
            createdAt: x.createdAt,
          }))}
        />
        <ul className="grid gap-3">
          {members
            .filter((p) => p.userId !== userId)
            .map((p) => (
              <RecordRow
                key={p.userId}
                title={p.name || p.email}
                actions={
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/family/dm/${p.userId}`}>แชท</Link>
                  </Button>
                }
              />
            ))}
        </ul>
        <GeoShare
          channelName={ablyGeo(familyId)}
          live={live}
          meId={userId}
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
