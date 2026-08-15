"use client";

import { useEffect, useMemo, useState } from "react";
import {
  pingLocation,
  pollLiveLocations,
  startLocationShare,
  stopLocationShare,
} from "@/app/(app)/family/actions";
import { Button } from "@/components/ui/button";
import { FamilyMap } from "@/components/family/family-map";
import { envHint } from "@/components/family/live-hint";
import { loadAbly, type RealtimeClient } from "@/lib/family/load-ably";

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
    let closed = false;
    let client: RealtimeClient | undefined;
    void loadAbly().then((Ably) => {
      if (closed) return;
      client = new Ably.Realtime({ authUrl: "/api/realtime/token" });
      const ch = client.channels.get(channelName);
      const merge = (d: Pin) => {
        if (!d?.userId) return;
        setPins((cur) => {
          const rest = cur.filter((p) => p.userId !== d.userId);
          return [...rest, { ...d, name: names[d.userId] ?? d.name ?? cur.find((p) => p.userId === d.userId)?.name }];
        });
        if (d.userId === meId && d.expiresAt) setUntil(d.expiresAt);
      };
      const onStop = (msg: { data: unknown }) => {
        const d = msg.data as { userId?: string };
        if (!d?.userId) return;
        setPins((cur) => cur.filter((p) => p.userId !== d.userId));
        if (d.userId === meId) setUntil(null);
      };
      void ch.subscribe("share", (msg) => merge(msg.data as Pin));
      void ch.subscribe("ping", (msg) => merge(msg.data as Pin));
      void ch.subscribe("stop", onStop);
    });
    return () => {
      closed = true;
      client?.close();
    };
  }, [channelName, live, meId, names]);

  const active = until ? new Date(until).getTime() > Date.now() : false;

  // Backup poll every 1s so pins stay fresh even if a realtime event is missed
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const next = await pollLiveLocations();
        if (!alive) return;
        setPins(next);
        const mine = next.find((p) => p.userId === meId);
        setUntil(mine?.expiresAt ?? null);
      } catch {
        /* ignore */
      }
    };
    const id = window.setInterval(tick, 1000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [meId]);

  // Broadcast location every 1 second while sharing
  useEffect(() => {
    if (!active) return;
    let watch = 0;
    let lastPos: GeolocationPosition | null = null;
    let timer = 0;

    watch = navigator.geolocation.watchPosition(
      (pos) => {
        lastPos = pos;
      },
      () => undefined,
      { enableHighAccuracy: true, maximumAge: 800, timeout: 8000 },
    );

    const send = () => {
      if (!lastPos) return;
      const fd = new FormData();
      fd.set("lat", String(lastPos.coords.latitude));
      fd.set("lng", String(lastPos.coords.longitude));
      void pingLocation(fd);
    };

    timer = window.setInterval(send, 1000);
    // first ping ASAP once we have a fix
    const kick = window.setInterval(() => {
      if (lastPos) {
        send();
        window.clearInterval(kick);
      }
    }, 250);

    return () => {
      navigator.geolocation.clearWatch(watch);
      window.clearInterval(timer);
      window.clearInterval(kick);
    };
  }, [active]);

  const visible = useMemo(
    () => pins.filter((p) => p.expiresAt && new Date(p.expiresAt).getTime() > Date.now() && p.lat && p.lng),
    [pins],
  );

  const mapPins = visible.map((p) => ({
    userId: p.userId,
    name: p.name ?? names[p.userId],
    lat: p.lat,
    lng: p.lng,
    me: p.userId === meId,
  }));

  return (
    <div className="grid gap-4">
      {live ? null : <p className="text-caption text-orange">{envHint}</p>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-title text-base">โลเคชันสด</p>
          <p className="text-caption">แชร์ 1 ชม. · ส่งพิกัดทุกวินาทีบนแผนที่</p>
        </div>
        {active ? (
          <form action={stopLocationShare}>
            <Button type="submit" variant="outline">
              หยุดแชร์
            </Button>
          </form>
        ) : (
          <form action={startLocationShare}>
            <Button type="submit">แชร์โลเคชัน</Button>
          </form>
        )}
      </div>

      <FamilyMap pins={mapPins} />

      <ul className="grid gap-2">
        {visible.length === 0 ? <li className="text-caption">ยังไม่มีคนแชร์ — กดแชร์แล้วเปิดหน้านี้ไว้</li> : null}
        {visible.map((p) => (
          <li key={p.userId} className="df-card flex items-center justify-between px-3 py-2.5">
            <div>
              <p className="text-sm font-medium">
                {p.name ?? names[p.userId] ?? "สมาชิก"}
                {p.userId === meId ? " · คุณ" : ""}
              </p>
              <p className="text-caption tabular">
                {Number(p.lat).toFixed(5)}, {Number(p.lng).toFixed(5)}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs text-kaffir">
              <span className="size-2 animate-pulse rounded-full bg-kaffir" />
              สด
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
