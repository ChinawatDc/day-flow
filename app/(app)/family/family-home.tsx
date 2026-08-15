import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { GroupChatLive } from "@/components/family/chat-live";
import { FamilyPlan } from "@/components/family/family-plan";
import { GeoShare } from "@/components/family/geo-share";
import { InviteQr } from "@/components/family/invite-qr";
import { ChapterTabs } from "@/components/notebook/chapter-tabs";
import { ConfirmDelete } from "@/components/notebook/confirm-delete";
import { RecordList, RecordRow, SoftTag } from "@/components/notebook/record-row";
import { StatStrip } from "@/components/notebook/stat-strip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  leaveFamily,
  removeMember,
  renameFamily,
  rotateJoinCode,
  transferOwnership,
} from "./actions";
import { env } from "@/lib/env";
import { ablyGeo, ablyGroup } from "@/lib/family/channels";
import {
  countUnread,
  listFamilyAppointments,
  listFamilyChores,
  listFamilyShopping,
  listLiveLocations,
  listMembers,
  listMessages,
} from "@/lib/family/data";

export async function FamilyHome({
  userId,
  familyId,
  name,
  joinCode,
  joinCodeExpiresAt,
  role,
  tab,
  sub,
}: {
  userId: string;
  familyId: string;
  name: string;
  joinCode: string;
  joinCodeExpiresAt: Date | string | null;
  role: string;
  tab?: string;
  sub?: string;
}) {
  const [members, messages, locations, shopping, chores, appointments, unread] = await Promise.all([
    listMembers(familyId),
    listMessages(familyId, "group"),
    listLiveLocations(familyId),
    listFamilyShopping(familyId),
    listFamilyChores(familyId),
    listFamilyAppointments(familyId),
    countUnread(familyId, userId, "group"),
  ]);
  const names = Object.fromEntries(members.map((p) => [p.userId, p.name || p.email]));
  const memberOpts = members.map((p) => ({ userId: p.userId, name: p.name || p.email }));
  const joinUrl = `${env.appUrl}/family/join?code=${encodeURIComponent(joinCode)}`;
  const myShare = locations.find((l) => l.userId === userId);
  const live = env.ablyConfigured;
  const inviteExpiry =
    joinCodeExpiresAt != null
      ? new Date(joinCodeExpiresAt).toLocaleDateString("th-TH", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : null;
  const others = members.filter((p) => p.userId !== userId);

  return (
    <AppShell title="ครอบครัว" subtitle={name}>
      <StatStrip
        items={[
          { label: "สมาชิก", value: String(members.length), emphasize: true },
          { label: "แชทใหม่", value: String(unread) },
          { label: "แชร์โลเคชัน", value: String(locations.length) },
        ]}
      />
      <ChapterTabs
        param="tab"
        value={tab || "house"}
        items={[
          { key: "house", label: "บ้าน", unset: ["sub"] },
          { key: "talk", label: "คุย", set: { sub: "group" } },
          { key: "plan", label: "วางแผน", set: { sub: "month" } },
          { key: "geo", label: "โลเคชัน", unset: ["sub"] },
        ]}
      >
        <div className="grid gap-4">
          {role === "owner" ? (
            <>
              <div className="df-card p-4">
                <p className="text-caption mb-2">ชื่อบ้าน</p>
                <form action={renameFamily} className="mb-4 flex gap-2">
                  <Input name="name" defaultValue={name} required className="flex-1" />
                  <Button type="submit" variant="outline" size="sm">
                    เปลี่ยนชื่อ
                  </Button>
                </form>
                <p className="text-caption mb-2">โค้ดเชิญ</p>
                <p className="text-title mb-1 tracking-wide">{joinCode}</p>
                {inviteExpiry ? <p className="text-caption mb-3">หมดอายุ {inviteExpiry}</p> : null}
                <InviteQr url={joinUrl} />
                <p className="text-caption mt-2 break-all">{joinUrl}</p>
                <form action={rotateJoinCode} className="mt-3">
                  <Button type="submit" variant="outline" size="sm">
                    หมุนโค้ดใหม่
                  </Button>
                </form>
              </div>
              {others.length > 0 ? (
                <div className="df-card p-4">
                  <p className="text-caption mb-2">โอนเจ้าของบ้าน</p>
                  <form action={transferOwnership} className="flex flex-wrap gap-2">
                    <select
                      name="userId"
                      required
                      className="h-11 min-w-[10rem] flex-1 rounded-[var(--radius-md)] border border-[var(--glass-line)] bg-[color-mix(in_oklch,var(--surface-solid)_70%,transparent)] px-2 text-sm backdrop-blur-[10px]"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        เลือกสมาชิก
                      </option>
                      {others.map((p) => (
                        <option key={p.userId} value={p.userId}>
                          {p.name || p.email}
                        </option>
                      ))}
                    </select>
                    <Button type="submit" variant="outline">
                      โอน
                    </Button>
                  </form>
                </div>
              ) : null}
            </>
          ) : (
            <p className="text-caption">ให้เจ้าของบ้านส่ง QR หรือโค้ด</p>
          )}
          <RecordList>
            {members.map((p) => (
              <RecordRow
                key={p.userId}
                flush
                title={p.name || p.email}
                tag={
                  <SoftTag tone={p.role === "owner" ? "kaffir" : "muted"}>
                    {p.role === "owner" ? "เจ้าของ" : "สมาชิก"}
                  </SoftTag>
                }
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
          </RecordList>
          {role === "owner" && others.length > 0 ? (
            <form action={leaveFamily} className="grid gap-2">
              <p className="text-caption">ออกจากบ้าน — ต้องโอนเจ้าของก่อน</p>
              <select
                name="newOwnerId"
                required
                className="h-11 rounded-[var(--radius-md)] border border-[var(--glass-line)] bg-[color-mix(in_oklch,var(--surface-solid)_70%,transparent)] px-2 text-sm backdrop-blur-[10px]"
                defaultValue=""
              >
                <option value="" disabled>
                  เลือกเจ้าของใหม่
                </option>
                {others.map((p) => (
                  <option key={p.userId} value={p.userId}>
                    {p.name || p.email}
                  </option>
                ))}
              </select>
              <Button type="submit" variant="outline">
                โอนแล้วออกจากครอบครัว
              </Button>
            </form>
          ) : (
            <form action={leaveFamily}>
              <Button type="submit" variant="outline">
                ออกจากครอบครัว
              </Button>
            </form>
          )}
        </div>
        <ChapterTabs
          param="sub"
          value={sub === "people" ? "people" : "group"}
          items={[
            { key: "group", label: "กลุ่ม" },
            { key: "people", label: "คน" },
          ]}
        >
          <GroupChatLive
            channelName={ablyGroup(familyId)}
            live={live}
            meId={userId}
            names={names}
            initial={messages.map((x) => ({
              id: x.id,
              senderId: x.senderId,
              body: x.body,
              createdAt: new Date(x.createdAt).toISOString(),
              imageR2Key: x.imageR2Key,
              deletedAt: x.deletedAt ? new Date(x.deletedAt).toISOString() : null,
            }))}
          />
          <RecordList>
            {others.map((p) => (
              <RecordRow
                key={p.userId}
                flush
                title={p.name || p.email}
                actions={
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/family/dm/${p.userId}`}>แชท</Link>
                  </Button>
                }
              />
            ))}
          </RecordList>
        </ChapterTabs>
        <FamilyPlan
          sub={sub}
          members={memberOpts}
          chores={chores.map((c) => ({
            id: c.id,
            title: c.title,
            dueOn: c.dueOn ? String(c.dueOn) : null,
            done: c.done,
            assigneeId: c.assigneeId,
          }))}
          shopping={shopping.map((s) => ({
            id: s.id,
            name: s.name,
            bought: s.bought,
            shopOn: s.shopOn ? String(s.shopOn) : null,
            assigneeId: s.assigneeId,
          }))}
          appointments={appointments.map((a) => ({
            id: a.id,
            title: a.title,
            startsAt: new Date(a.startsAt).toISOString(),
            endsAt: a.endsAt ? new Date(a.endsAt).toISOString() : null,
            place: a.place,
            assigneeId: a.assigneeId,
          }))}
        />
        <GeoShare
          channelName={ablyGeo(familyId)}
          live={live}
          meId={userId}
          role={role}
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
