"use client";

import { useCallback } from "react";
import { pollDmMessages, pollGroupMessages, sendDmMessage, sendGroupMessage } from "@/app/(app)/family/actions";
import { FamilyChat, type ChatMsg } from "@/components/family/family-chat";

export function GroupChatLive({
  channelName,
  live,
  meId,
  names,
  initial,
}: {
  channelName: string;
  live: boolean;
  meId: string;
  names: Record<string, string>;
  initial: ChatMsg[];
}) {
  const poll = useCallback(() => pollGroupMessages(), []);
  return (
    <FamilyChat
      channelName={channelName}
      live={live}
      meId={meId}
      names={names}
      initial={initial}
      action={sendGroupMessage}
      poll={poll}
    />
  );
}

export function DmChatLive({
  channelName,
  live,
  meId,
  peerId,
  names,
  initial,
}: {
  channelName: string;
  live: boolean;
  meId: string;
  peerId: string;
  names: Record<string, string>;
  initial: ChatMsg[];
}) {
  const poll = useCallback(() => pollDmMessages(peerId), [peerId]);
  return (
    <FamilyChat
      channelName={channelName}
      live={live}
      meId={meId}
      names={names}
      initial={initial}
      action={sendDmMessage}
      hiddenFields={<input type="hidden" name="peerId" value={peerId} />}
      poll={poll}
    />
  );
}
