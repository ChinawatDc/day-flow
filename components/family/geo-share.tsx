"use client";

import { useEffect, useState } from "react";
import Ably from "ably";
import { pingLocation, startLocationShare, stopLocationShare } from "@/app/(app)/family/actions";
import { Button } from "@/components/ui/button";
import { envHint } from "@/components/family/live-hint";

type Pin = {
  userId: string;
  name?: string;
  lat: string;
  lng: string;
  expiresAt: string;
};

export function GeoShare({
  channelName,
  live,
  meId,
  names,
  initial,
  sharingUntil,
}: {
  channelName: string;
  live: boolean;
  meId: string;
  names: Record<string, string>;
  initial: Pin[];
  sharingUntil: string | null;
}) {
  const [pins, setPins] = useState(initial);
  const [until, setUntil] = useState(sharingUntil);

  useEffect(() => {
    setPins(initial);
    setUntil(sharingUntil);
  }, [initial, sharingUntil]);

  useEffect(() => {
    if (!live) return;
    const client = new Ably.Realtime({ authUrl: "/api/realtime/token" });
    const ch = client.channels.get(channelName);
    const onShare = (msg: Ably.Message) => {
      const d = msg.data as Pin;
      if (!d?.userId) return;
      setPins((cur) => {
        const rest = cur.filter((p) => p.userId !== d.userId);
        return [...rest, { ...d, name: names[d.userId] }];
      });
      if (d.userId === meId) setUntil(d.expiresAt);
    };
    const onPing = (msg: Ably.Message) => {
      const d = msg.data as Pin;
      if (!d?.userId) return;
      setPins((cur) => {
        const rest = cur.filter((p) => p.userId !== d.userId);
        return [...rest, { ...d, name: names[d.userId] ?? cur.find((p) => p.userId === d.userId)?.name }];
      });
    };
    const onStop = (msg: Ably.Message) => {
      const d = msg.data as { userId?: string };
      if (!d?.userId) return;
      setPins((cur) => cur.filter((p) => p.userId !== d.userId));
      if (d.userId === meId) setUntil(null);
    };
    void ch.subscribe("share", onShare);
    void ch.subscribe("ping", onPing);
    void ch.subscribe("stop", onStop);
    return () => {
      ch.unsubscribe();
      client.close();
    };
  }, [channelName, live, meId, names]);

  const active = until ? new Date(until).getTime() > Date.now() : false;

  useEffect(() => {
    if (!active) return;
    let watch = 0;
    let last = 0;
    watch = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now();
        if (now - last < 12000) return;
        last = now;
        const fd = new FormData();
        fd.set("lat", String(pos.coords.latitude));
        fd.set("lng", String(pos.coords.longitude));
        void pingLocation(fd);
      },
      () => undefined,
      { enableHighAccuracy: true, maximumAge: 10000 },
    );
    return () => navigator.geolocation.clearWatch(watch);
  }, [active]);

  const visible = pins.filter((p) => p.expiresAt && new Date(p.expiresAt).getTime() > Date.now());

  return (
    <div className="grid gap-3">
      {live ? null : <p className="text-caption text-orange">{envHint}</p>}
      <p className="text-caption">แชร์ได้ 1 ชั่วโมง แล้วปิดเอง — เปิดหน้านี้ไว้ตอนส่งพิกัด</p>
      {active ? (
        <form action={stopLocationShare}>
          <Button type="submit" variant="outline">
            หยุดแชร์
          </Button>
        </form>
      ) : (
        <form action={startLocationShare}>
          <Button type="submit">แชร์โลเคชัน 1 ชม.</Button>
        </form>
      )}
      <ul className="grid gap-2">
        {visible.length === 0 ? <li className="text-caption">ยังไม่มีคนแชร์</li> : null}
        {visible.map((p) => (
          <li key={p.userId} className="rounded-xl border border-line px-3 py-2">
            <p className="text-sm font-medium">{p.name ?? names[p.userId] ?? "สมาชิก"}</p>
            {p.lat && p.lng ? (
              <a
                className="text-caption text-kaffir"
                href={`https://maps.google.com/?q=${p.lat},${p.lng}`}
                target="_blank"
                rel="noreferrer"
              >
                {p.lat}, {p.lng} · แผนที่
              </a>
            ) : (
              <p className="text-caption">รอพิกัด</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
