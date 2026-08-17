"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";

export type HuntMapPin = {
  id: string;
  name: string;
  lat: string;
  lng: string;
  priceLabel?: string;
  href?: string;
  kind: "project" | "itf";
  traffic?: string;
};

const TRAFFIC_FILL: Record<string, string> = {
  green: "#3d9a6a",
  yellow: "#c9a227",
  orange: "#d47a2c",
  red: "#c44c4c",
};

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function popupHtml(p: HuntMapPin) {
  const title = escapeHtml(p.name);
  const price = p.priceLabel ? `<p style="margin:.35rem 0 0;color:#c9b27a">${escapeHtml(p.priceLabel)}</p>` : "";
  const approx = `<p style="margin:.35rem 0 0;font-size:12px;opacity:.75">ตำแหน่งโดยประมาณ</p>`;
  const link = p.href
    ? `<p style="margin:.5rem 0 0"><a href="${escapeHtml(p.href)}" style="color:#e0c56a">ดูรายละเอียด</a></p>`
    : "";
  return `<strong>${title}</strong>${price}${approx}${link}`;
}

function pinHtml(p: HuntMapPin) {
  const fill = p.kind === "itf" ? "#f4efe6" : TRAFFIC_FILL[p.traffic ?? ""] ?? "#c9a227";
  const size = p.kind === "itf" ? 44 : 36;
  const label = p.kind === "itf" ? "ITF" : String(p.name.trim().slice(0, 1) || "#");
  return {
    size,
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:999px;
      display:grid;place-items:center;
      background:${fill};color:#1c1917;font:700 12px Prompt,Bai Jamjuree,sans-serif;
      border:2px solid rgba(244,239,230,.9);
      box-shadow:0 6px 16px rgba(12,10,9,.35);
    ">${escapeHtml(label)}</div>`,
  };
}

export function HuntMap({
  pins,
  compact = false,
  hostClassName,
}: {
  pins: HuntMapPin[];
  compact?: boolean;
  hostClassName?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markers = useRef<Map<string, LeafletMarker>>(new Map());
  const fitted = useRef(false);
  const pinsRef = useRef(pins);
  pinsRef.current = pins;
  const pinKey = pins.map((p) => `${p.id}:${p.lat}:${p.lng}`).join("|");

  useEffect(() => {
    fitted.current = false;
  }, [pinKey]);

  useEffect(() => {
    let cancelled = false;

    async function sync() {
      const map = mapRef.current;
      if (!map || cancelled) return;
      const L = (await import("leaflet")).default;
      if (cancelled || mapRef.current !== map) return;

      const seen = new Set<string>();
      const latlngs: [number, number][] = [];

      for (const p of pinsRef.current) {
        const lat = Number(p.lat);
        const lng = Number(p.lng);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
        seen.add(p.id);
        latlngs.push([lat, lng]);
        const { size, html } = pinHtml(p);
        const icon = L.divIcon({
          className: "",
          html,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });
        const existing = markers.current.get(p.id);
        if (existing) {
          existing.setLatLng([lat, lng]);
          existing.setIcon(icon);
          existing.setPopupContent(popupHtml(p));
        } else {
          const m = L.marker([lat, lng], { icon, zIndexOffset: p.kind === "itf" ? 400 : 0 }).addTo(map);
          m.bindPopup(popupHtml(p));
          markers.current.set(p.id, m);
        }
      }

      for (const [id, m] of markers.current) {
        if (!seen.has(id)) {
          map.removeLayer(m);
          markers.current.delete(id);
        }
      }

      if (latlngs.length > 0 && !fitted.current) {
        map.fitBounds(L.latLngBounds(latlngs), { padding: [40, 40], maxZoom: compact ? 14 : 13 });
        fitted.current = true;
      }
    }

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
      }).setView([13.7563, 100.5018], 11);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      mapRef.current = map;
      for (const ms of [80, 220, 480]) {
        setTimeout(() => {
          if (!cancelled) map.invalidateSize();
        }, ms);
      }
      await sync();
    }

    void boot();
    void sync();

    return () => {
      cancelled = true;
      const map = mapRef.current;
      mapRef.current = null;
      markers.current.clear();
      map?.remove();
    };
  }, [compact, pinKey]);

  return (
    <div className="hh-card overflow-hidden">
      <div
        ref={host}
        className={
          hostClassName ??
          (compact ? "h-[220px] w-full bg-[var(--hh-surface)]" : "h-[62vh] min-h-[280px] w-full bg-[var(--hh-surface)]")
        }
      />
      <p className="text-caption border-t border-[var(--hh-line)] px-3 py-2">
        ตำแหน่งโดยประมาณของโซน ไม่ใช่ประตูโครงการ · OpenStreetMap
      </p>
    </div>
  );
}
