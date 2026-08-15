"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";

export type MapPin = {
  userId: string;
  name?: string;
  lat: string;
  lng: string;
  me?: boolean;
};

function hueFromId(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360;
  return h;
}

function initialOf(name?: string) {
  const t = (name ?? "?").trim();
  return t.slice(0, 1).toUpperCase() || "?";
}

export function FamilyMap({ pins }: { pins: MapPin[] }) {
  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markers = useRef<Map<string, LeafletMarker>>(new Map());
  const fitted = useRef(false);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      if (!host.current || mapRef.current) return;
      const L = (await import("leaflet")).default;
      if (cancelled || !host.current) return;

      if (!document.querySelector("link[data-leaflet-css]")) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        link.dataset.leafletCss = "1";
        document.head.appendChild(link);
      }

      const map = L.map(host.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView([13.7563, 100.5018], 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      mapRef.current = map;
      // force size after sheet/tab layout
      setTimeout(() => map.invalidateSize(), 80);
    }
    void boot();
    return () => {
      cancelled = true;
      const map = mapRef.current;
      mapRef.current = null;
      markers.current.clear();
      map?.remove();
    };
  }, []);

  useEffect(() => {
    let alive = true;
    async function sync() {
      const map = mapRef.current;
      if (!map) return;
      const L = (await import("leaflet")).default;
      if (!alive) return;

      const seen = new Set<string>();
      const latlngs: [number, number][] = [];

      for (const p of pins) {
        const lat = Number(p.lat);
        const lng = Number(p.lng);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
        seen.add(p.userId);
        latlngs.push([lat, lng]);
        const hue = hueFromId(p.userId);
        const label = initialOf(p.name);
        const html = `<div style="
          width:40px;height:40px;border-radius:999px;
          display:grid;place-items:center;
          background:hsl(${hue} 48% ${p.me ? "38%" : "46%"});
          color:#f4efe6;font:700 15px Prompt,sans-serif;
          border:3px solid ${p.me ? "#f4efe6" : "rgba(244,239,230,.85)"};
          box-shadow:0 6px 16px rgba(28,25,23,.28);
        ">${label}</div>`;

        const icon = L.divIcon({
          className: "",
          html,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const existing = markers.current.get(p.userId);
        if (existing) {
          existing.setLatLng([lat, lng]);
          existing.setIcon(icon);
          existing.setPopupContent(`<strong>${p.name ?? "สมาชิก"}</strong>`);
        } else {
          const m = L.marker([lat, lng], { icon }).addTo(map);
          m.bindPopup(`<strong>${p.name ?? "สมาชิก"}</strong>`);
          markers.current.set(p.userId, m);
        }
      }

      for (const [id, m] of markers.current) {
        if (!seen.has(id)) {
          map.removeLayer(m);
          markers.current.delete(id);
        }
      }

      if (latlngs.length > 0 && !fitted.current) {
        map.fitBounds(L.latLngBounds(latlngs), { padding: [48, 48], maxZoom: 16 });
        fitted.current = true;
      } else if (latlngs.length === 1) {
        map.panTo(latlngs[0], { animate: true, duration: 0.4 });
      }
    }
    void sync();
    return () => {
      alive = false;
    };
  }, [pins]);

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--stroke)] shadow-[var(--shadow-md)]">
      <div ref={host} className="h-[52vh] min-h-[280px] w-full bg-paper-2" />
      <p className="text-caption border-t border-[var(--stroke)] bg-surface px-3 py-2">
        OpenStreetMap · หมุดขยับตามคนที่แชร์ (อัปเดตทุกวินาที)
      </p>
    </div>
  );
}
