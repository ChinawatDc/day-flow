import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DmChatLive } from "@/components/family/chat-live";
import { env } from "@/lib/env";
import { ablyDm, dmChannel } from "@/lib/family/channels";
import { getMembership, listMembers, listMessages } from "@/lib/family/data";
import { requireUser } from "@/lib/session";

export default async function FamilyDmPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const user = await requireUser();
  const { userId: peerId } = await params;
  const m = await getMembership(user.id);
  if (!m) redirect("/family");
  if (peerId === user.id) redirect("/family");
  const members = await listMembers(m.familyId);
  const peer = members.find((p) => p.userId === peerId);
  if (!peer) notFound();
  const channel = dmChannel(user.id, peerId);
  const messages = await listMessages(m.familyId, channel);
  const names = Object.fromEntries(members.map((p) => [p.userId, p.name || p.email]));

  return (
    <AppShell title={peer.name || "แชท"}>
      <p className="mb-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/family">กลับครอบครัว</Link>
        </Button>
      </p>
      <DmChatLive
        channelName={ablyDm(m.familyId, user.id, peerId)}
        live={env.ablyConfigured}
        meId={user.id}
        peerId={peerId}
        names={names}
        initial={messages.map((x) => ({
          id: x.id,
          senderId: x.senderId,
          body: x.body,
          createdAt: x.createdAt,
          imageR2Key: x.imageR2Key,
          deletedAt: x.deletedAt,
        }))}
      />
    </AppShell>
  );
}
