"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  extendLocationShare,
  pingLocation,
  pollLiveLocations,
  startLocationShare,
  stopLocationShare,
  stopMemberLocationShare,
} from "@/app/(app)/family/actions";
import { Button } from "@/components/ui/button";
import { FamilyMap } from "@/components/family/family-map";
import { envHint } from "@/components/family/live-hint";
import { useBackupPoll } from "@/components/family/use-backup-poll";
import { loadAbly, type RealtimeClient } from "@/lib/family/load-ably";

type Pin = {
  userId: string;
  name?: string;
  lat: string;
  lng: string;
  expiresAt: string;
};

function metersBetween(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function formatRemain(untilIso: string, now: number) {
  const ms = new Date(untilIso).getTime() - now;
  if (ms <= 0) return "หมดแล้ว";
  const m = Math.ceil(ms / 60000);
  if (m < 60) return `${m} นาที`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `${h} ชม. ${rem} นาที` : `${h} ชม.`;
}

export function GeoShare({
  channelName,
  live,
  meId,
  role,
  names,
  initial,
  sharingUntil,
}: {
  channelName: string;
  live: boolean;
  meId: string;
  role: string;
  names: Record<string, string>;
  initial: Pin[];
  sharingUntil: string | null;
}) {
  const [pins, setPins] = useState(initial);
  const [until, setUntil] = useState(sharingUntil);
  const [now, setNow] = useState(() => Date.now());
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    setPins(initial);
    setUntil(sharingUntil);
  }, [initial, sharingUntil]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => window.clearInterval(id);
  }, []);

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
          return [
            ...rest,
            { ...d, name: names[d.userId] ?? d.name ?? cur.find((p) => p.userId === d.userId)?.name },
          ];
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

  const active = until ? new Date(until).getTime() > now : false;

  const pollTick = useCallback(async () => {
    const next = await pollLiveLocations();
    setPins(next);
    const mine = next.find((p) => p.userId === meId);
    setUntil(mine?.expiresAt ?? null);
  }, [meId]);

  useBackupPoll(true, live, pollTick);

  // GPS: threshold move (≥25m) or at least every 5s — only while this tab is mounted & sharing
  useEffect(() => {
    if (!active) return;
    let watch = 0;
    let lastPos: GeolocationPosition | null = null;
    let lastSent: { lat: number; lng: number; at: number } | null = null;
    let timer = 0;

    watch = navigator.geolocation.watchPosition(
      (pos) => {
        lastPos = pos;
      },
      () => undefined,
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 8000 },
    );

    const send = () => {
      if (!lastPos) return;
      const lat = lastPos.coords.latitude;
      const lng = lastPos.coords.longitude;
      const t = Date.now();
      const moved =
        !lastSent || metersBetween(lastSent.lat, lastSent.lng, lat, lng) >= 25;
      const stale = !lastSent || t - lastSent.at >= 5000;
      if (!moved && !stale) return;
      lastSent = { lat, lng, at: t };
      const fd = new FormData();
      fd.set("lat", String(lat));
      fd.set("lng", String(lng));
      void pingLocation(fd);
    };

    timer = window.setInterval(send, 1000);
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
    () =>
      pins.filter(
        (p) => p.expiresAt && new Date(p.expiresAt).getTime() > now && p.lat && p.lng,
      ),
    [pins, now],
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
          {active && until ? (
            <p className="text-caption tabular">เหลือ {formatRemain(until, now)}</p>
          ) : null}
        </div>
        {active ? (
          <div className="flex flex-wrap gap-2">
            <form action={extendLocationShare}>
              <input type="hidden" name="minutes" value="15" />
              <Button type="submit" variant="outline" size="sm">
                +15 นาที
              </Button>
            </form>
            <form action={extendLocationShare}>
              <input type="hidden" name="minutes" value="60" />
              <Button type="submit" variant="outline" size="sm">
                +1 ชม.
              </Button>
            </form>
            <form action={stopLocationShare}>
              <Button type="submit" variant="outline">
                หยุดแชร์
              </Button>
            </form>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <form action={startLocationShare}>
              <input type="hidden" name="minutes" value="15" />
              <Button type="submit" variant="outline" size="sm">
                15 นาที
              </Button>
            </form>
            <form action={startLocationShare}>
              <input type="hidden" name="minutes" value="60" />
              <Button type="submit" size="sm">
                1 ชม.
              </Button>
            </form>
            <form action={startLocationShare}>
              <input type="hidden" name="minutes" value="0" />
              <Button type="submit" variant="soft" size="sm">
                จนปิดเอง
              </Button>
            </form>
          </div>
        )}
      </div>

      {mapReady || visible.length > 0 ? (
        <FamilyMap pins={mapPins} />
      ) : (
        <button
          type="button"
          className="df-card flex h-[200px] items-center justify-center text-sm text-ink-muted"
          onClick={() => setMapReady(true)}
        >
          เปิดแผนที่
        </button>
      )}

      <ul className="grid gap-2">
        {visible.length === 0 ? (
          <li className="text-caption">ยังไม่มีคนแชร์</li>
        ) : null}
        {visible.map((p) => (
          <li key={p.userId} className="df-card flex items-center justify-between gap-2 px-3 py-2.5">
            <div>
              <p className="text-sm font-medium">
                {p.name ?? names[p.userId] ?? "สมาชิก"}
                {p.userId === meId ? " · คุณ" : ""}
              </p>
              <p className="text-caption tabular">
                {Number(p.lat).toFixed(5)}, {Number(p.lng).toFixed(5)}
                {" · "}
                หมดใน {formatRemain(p.expiresAt, now)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-kaffir">
                <span className="size-2 animate-pulse rounded-full bg-kaffir" />
                สด
              </span>
              {role === "owner" && p.userId !== meId ? (
                <form action={stopMemberLocationShare}>
                  <input type="hidden" name="userId" value={p.userId} />
                  <Button type="submit" size="sm" variant="ghost">
                    ปิด
                  </Button>
                </form>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
