"use client";

import { useCallback } from "react";
import {
  deleteOwnMessage,
  loadOlderDmMessages,
  loadOlderGroupMessages,
  markFamilyChannelRead,
  pollDmMessages,
  pollGroupMessages,
  sendDmMessage,
  sendGroupMessage,
} from "@/app/(app)/family/actions";
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
  const loadOlder = useCallback((beforeIso: string) => loadOlderGroupMessages(beforeIso), []);
  const onOpen = useCallback(() => markFamilyChannelRead("group"), []);
  return (
    <FamilyChat
      channelName={channelName}
      live={live}
      meId={meId}
      names={names}
      initial={initial}
      action={sendGroupMessage}
      poll={poll}
      loadOlder={loadOlder}
      onOpen={onOpen}
      deleteAction={deleteOwnMessage}
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
  const loadOlder = useCallback((beforeIso: string) => loadOlderDmMessages(peerId, beforeIso), [peerId]);
  const onOpen = useCallback(() => {
    const a = [meId, peerId].sort((x, y) => x.localeCompare(y)).join(":");
    return markFamilyChannelRead(a);
  }, [meId, peerId]);
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
      loadOlder={loadOlder}
      onOpen={onOpen}
      deleteAction={deleteOwnMessage}
    />
  );
}
