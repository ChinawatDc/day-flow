"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { envHint } from "@/components/family/live-hint";
import { useBackupPoll } from "@/components/family/use-backup-poll";
import { loadAbly, type RealtimeClient } from "@/lib/family/load-ably";

export type ChatMsg = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string | Date;
  imageR2Key?: string | null;
  deletedAt?: string | Date | null;
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
  loadOlder,
  onOpen,
  deleteAction,
}: {
  channelName: string;
  live: boolean;
  meId: string;
  names: Record<string, string>;
  initial: ChatMsg[];
  action: (formData: FormData) => void | Promise<void>;
  hiddenFields?: React.ReactNode;
  poll?: () => Promise<ChatMsg[]>;
  loadOlder?: (beforeIso: string) => Promise<ChatMsg[]>;
  onOpen?: () => void | Promise<void>;
  deleteAction?: (formData: FormData) => void | Promise<void>;
}) {
  const [rows, setRows] = useState(initial);
  const [pending, start] = useTransition();
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(initial.length >= 40);
  const bottom = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRows(initial);
    setHasMore(initial.length >= 40);
  }, [initial]);

  useEffect(() => {
    void onOpen?.();
  }, [onOpen]);

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
        setRows((cur) => {
          const idx = cur.findIndex((r) => r.id === data.id);
          if (idx >= 0) {
            const next = [...cur];
            next[idx] = { ...next[idx], ...data };
            return next;
          }
          return [...cur, data];
        });
      };
      void ch.subscribe("message", onMsg);
    });
    return () => {
      closed = true;
      client?.close();
    };
  }, [channelName, live]);

  const pollTick = useCallback(async () => {
    if (!poll) return;
    const next = await poll();
    if (!next) return;
    setRows((cur) => {
      if (next.length === cur.length && next.every((m, i) => m.id === cur[i]?.id && m.deletedAt === cur[i]?.deletedAt)) {
        return cur;
      }
      return next;
    });
  }, [poll]);

  useBackupPoll(Boolean(poll), live, pollTick);

  async function onLoadOlder() {
    if (!loadOlder || loadingOlder || rows.length === 0) return;
    setLoadingOlder(true);
    try {
      const oldest = rows[0];
      const before =
        oldest.createdAt instanceof Date ? oldest.createdAt.toISOString() : String(oldest.createdAt);
      const older = await loadOlder(before);
      if (older.length === 0) {
        setHasMore(false);
      } else {
        setRows((cur) => {
          const ids = new Set(cur.map((r) => r.id));
          return [...older.filter((m) => !ids.has(m.id)), ...cur];
        });
        if (older.length < 40) setHasMore(false);
      }
    } finally {
      setLoadingOlder(false);
    }
  }

  return (
    <div className="df-card flex flex-col overflow-hidden">
      {live ? null : <p className="text-caption px-3 pt-3 text-orange">{envHint}</p>}
      {hasMore && loadOlder ? (
        <div className="px-3 pt-3">
          <Button type="button" variant="ghost" size="sm" disabled={loadingOlder} onClick={() => void onLoadOlder()}>
            {loadingOlder ? "กำลังโหลด…" : "ข้อความเก่ากว่า"}
          </Button>
        </div>
      ) : null}
      <ul className="mb-0 grid max-h-[52vh] gap-2 overflow-y-auto px-3 py-3">
        {rows.length === 0 ? <li className="text-caption py-8 text-center">ยังไม่มีข้อความ</li> : null}
        {rows.map((m) => {
          const mine = m.senderId === meId;
          const deleted = Boolean(m.deletedAt);
          return (
            <li key={m.id} className={mine ? "ml-10 flex justify-end" : "mr-10 flex justify-start"}>
              <div
                className={
                  mine
                    ? "max-w-[85%] rounded-[var(--radius-md)] rounded-br-md bg-kaffir px-3.5 py-2 text-surface shadow-[var(--shadow-sm)]"
                    : "max-w-[85%] rounded-[var(--radius-md)] rounded-bl-md border border-[var(--glass-line)] bg-[color-mix(in_oklch,var(--surface-solid)_78%,transparent)] px-3.5 py-2 shadow-[var(--shadow-sm)] backdrop-blur-[12px]"
                }
              >
                <p className={`text-[11px] ${mine ? "text-surface/75" : "text-ink-muted"}`}>
                  {names[m.senderId] ?? "สมาชิก"}
                </p>
                {deleted ? (
                  <p className={`text-sm italic ${mine ? "text-surface/70" : "text-ink-muted"}`}>ลบแล้ว</p>
                ) : (
                  <>
                    {m.imageR2Key ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`/api/files?key=${encodeURIComponent(m.imageR2Key)}`}
                        alt=""
                        className="mb-1 max-h-48 w-full rounded-[var(--radius-sm)] object-cover"
                      />
                    ) : null}
                    {m.body ? <p className="text-sm whitespace-pre-wrap leading-snug">{m.body}</p> : null}
                  </>
                )}
                {mine && !deleted && deleteAction ? (
                  <form
                    className="mt-1 flex justify-end"
                    action={deleteAction}
                    onSubmit={(e) => {
                      if (!window.confirm("ลบข้อความนี้?")) e.preventDefault();
                    }}
                  >
                    <input type="hidden" name="id" value={m.id} />
                    <button type="submit" className={`inline-flex items-center gap-1 text-[11px] ${mine ? "text-surface/70" : "text-ink-muted"}`}>
                      <Trash2 className="size-3" strokeWidth={2} />
                      ลบ
                    </button>
                  </form>
                ) : null}
              </div>
            </li>
          );
        })}
        <div ref={bottom} />
      </ul>
      <form
        ref={formRef}
        className="flex flex-wrap gap-2 border-t border-[var(--glass-line)] bg-[color-mix(in_oklch,var(--surface-solid)_55%,transparent)] p-3 backdrop-blur-[12px]"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const body = String(fd.get("body") ?? "").trim();
          const image = fd.get("image");
          const hasImage = image instanceof File && image.size > 0;
          if (!body && !hasImage) return;
          start(async () => {
            await action(fd);
            formRef.current?.reset();
            if (fileRef.current) fileRef.current.value = "";
          });
        }}
      >
        {hiddenFields}
        <Input name="body" placeholder="ข้อความ…" autoComplete="off" className="min-w-[10rem] flex-1" />
        <Input ref={fileRef} name="image" type="file" accept="image/*" className="max-w-[9.5rem] text-xs" />
        <Button type="submit" disabled={pending} className="shrink-0 px-5">
          ส่ง
        </Button>
      </form>
    </div>
  );
}
