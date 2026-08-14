"use client";

import { useEffect, useRef, useState } from "react";
import Ably from "ably";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { envHint } from "@/components/family/live-hint";

export type ChatMsg = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string | Date;
};

export function FamilyChat({
  channelName,
  live,
  meId,
  names,
  initial,
  action,
  hiddenFields,
}: {
  channelName: string;
  live: boolean;
  meId: string;
  names: Record<string, string>;
  initial: ChatMsg[];
  action: (formData: FormData) => void | Promise<void>;
  hiddenFields?: React.ReactNode;
}) {
  const [rows, setRows] = useState(initial);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRows(initial);
  }, [initial]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [rows.length]);

  useEffect(() => {
    if (!live) return;
    const client = new Ably.Realtime({ authUrl: "/api/realtime/token" });
    const ch = client.channels.get(channelName);
    const onMsg = (msg: Ably.Message) => {
      const data = msg.data as ChatMsg | undefined;
      if (!data?.id) return;
      setRows((cur) => (cur.some((r) => r.id === data.id) ? cur : [...cur, data]));
    };
    void ch.subscribe("message", onMsg);
    return () => {
      ch.unsubscribe("message", onMsg);
      client.close();
    };
  }, [channelName, live]);

  return (
    <div>
      {live ? null : <p className="text-caption mb-3 text-orange">{envHint}</p>}
      <ul className="mb-4 grid max-h-[50vh] gap-2 overflow-y-auto">
        {rows.length === 0 ? <li className="text-caption">ยังไม่มีข้อความ</li> : null}
        {rows.map((m) => (
          <li
            key={m.id}
            className={
              m.senderId === meId
                ? "ml-8 rounded-xl bg-kaffir px-3 py-2 text-paper"
                : "mr-8 rounded-xl border border-line bg-paper-2 px-3 py-2"
            }
          >
            <p className="text-caption opacity-80">{names[m.senderId] ?? "สมาชิก"}</p>
            <p className="text-sm whitespace-pre-wrap">{m.body}</p>
          </li>
        ))}
        <div ref={bottom} />
      </ul>
      <form action={action} className="flex gap-2">
        {hiddenFields}
        <Input name="body" placeholder="ข้อความ" required autoComplete="off" />
        <Button type="submit">ส่ง</Button>
      </form>
    </div>
  );
}
