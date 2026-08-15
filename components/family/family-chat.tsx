"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { envHint } from "@/components/family/live-hint";
import { loadAbly, type RealtimeClient } from "@/lib/family/load-ably";

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
  poll,
}: {
  channelName: string;
  live: boolean;
  meId: string;
  names: Record<string, string>;
  initial: ChatMsg[];
  action: (formData: FormData) => void | Promise<void>;
  hiddenFields?: React.ReactNode;
  /** Optional 1s poll when Ably is off or as backup */
  poll?: () => Promise<ChatMsg[]>;
}) {
  const [rows, setRows] = useState(initial);
  const [pending, start] = useTransition();
  const bottom = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setRows(initial);
  }, [initial]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [rows.length]);

  useEffect(() => {
    if (!live) return;
    let closed = false;
    let client: RealtimeClient | undefined;
    void loadAbly().then((Ably) => {
      if (closed) return;
      client = new Ably.Realtime({ authUrl: "/api/realtime/token" });
      const ch = client.channels.get(channelName);
      const onMsg = (msg: { data: unknown }) => {
        const data = msg.data as ChatMsg | undefined;
        if (!data?.id) return;
        setRows((cur) => (cur.some((r) => r.id === data.id) ? cur : [...cur, data]));
      };
      void ch.subscribe("message", onMsg);
    });
    return () => {
      closed = true;
      client?.close();
    };
  }, [channelName, live]);

  useEffect(() => {
    if (!poll) return;
    let alive = true;
    const tick = async () => {
      try {
        const next = await poll();
        if (!alive || !next) return;
        setRows((cur) => {
          if (next.length === cur.length && next.every((m, i) => m.id === cur[i]?.id)) return cur;
          return next;
        });
      } catch {
        /* ignore poll errors */
      }
    };
    const id = window.setInterval(tick, 1000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [poll]);

  return (
    <div className="df-card flex flex-col overflow-hidden">
      {live ? null : <p className="text-caption px-3 pt-3 text-orange">{envHint}</p>}
      <ul className="mb-0 grid max-h-[52vh] gap-2 overflow-y-auto px-3 py-3">
        {rows.length === 0 ? <li className="text-caption py-8 text-center">ยังไม่มีข้อความ — พิมพ์ด้านล่าง</li> : null}
        {rows.map((m) => {
          const mine = m.senderId === meId;
          return (
            <li key={m.id} className={mine ? "ml-10 flex justify-end" : "mr-10 flex justify-start"}>
              <div
                className={
                  mine
                    ? "max-w-[85%] rounded-[var(--radius-md)] rounded-br-md bg-kaffir px-3.5 py-2 text-surface shadow-[var(--shadow-sm)]"
                    : "max-w-[85%] rounded-[var(--radius-md)] rounded-bl-md border border-[var(--stroke)] bg-surface px-3.5 py-2 shadow-[var(--shadow-sm)]"
                }
              >
                <p className={`text-[11px] ${mine ? "text-surface/75" : "text-ink-muted"}`}>
                  {names[m.senderId] ?? "สมาชิก"}
                </p>
                <p className="text-sm whitespace-pre-wrap leading-snug">{m.body}</p>
              </div>
            </li>
          );
        })}
        <div ref={bottom} />
      </ul>
      <form
        ref={formRef}
        className="flex gap-2 border-t border-[var(--stroke)] bg-surface p-3"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const body = String(fd.get("body") ?? "").trim();
          if (!body) return;
          start(async () => {
            await action(fd);
            formRef.current?.reset();
          });
        }}
      >
        {hiddenFields}
        <Input name="body" placeholder="ข้อความ…" required autoComplete="off" className="rounded-full" />
        <Button type="submit" disabled={pending} className="rounded-full px-5">
          ส่ง
        </Button>
      </form>
    </div>
  );
}
