"use client";

import { useState } from "react";
import Link from "next/link";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { MapPin, X } from "lucide-react";
import { HuntMap } from "@/components/hunt/hunt-map";
import { formatPriceRange, googleMapsHref } from "@/lib/hunt/format";
import { cn } from "@/lib/utils";

export type HuntMapTarget = {
  id: string;
  name: string;
  zone: string;
  lat?: string | null;
  lng?: string | null;
  traffic?: string;
  priceStartSatang: number;
  priceMaxSatang?: number | null;
  unitCheck?: boolean;
};

export function HuntMapModalButton({
  project,
  compact,
}: {
  project: HuntMapTarget;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const hasPin = Boolean(project.lat && project.lng);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          disabled={!hasPin}
          aria-label={`ดูแมพ ${project.name}`}
          className={cn(
            compact ? "hh-btn-ghost hh-btn h-8 w-8 px-0" : "hh-btn-ghost hh-btn h-9 w-9 px-0",
            !hasPin && "opacity-40",
          )}
        >
          <MapPin className={compact ? "size-3.5" : "size-4"} />
        </button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-black/55" />
        <DialogPrimitive.Content className="hh-dialog fixed inset-x-3 top-[8vh] z-[60] mx-auto max-h-[84vh] w-auto max-w-xl overflow-y-auto rounded-2xl border border-[var(--hh-line)] p-4 shadow-[0_24px_64px_oklch(0.1_0.02_250_/_0.55)] outline-none md:inset-x-auto md:left-1/2 md:w-[36rem] md:-translate-x-1/2 md:p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <DialogPrimitive.Title className="font-[family-name:var(--font-title)] text-lg font-semibold">
                {project.name}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-caption mt-1">
                {project.zone} · ตำแหน่งโดยประมาณของโซน ไม่ใช่ประตูโครงการ
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close className="hh-btn-ghost hh-btn size-9 shrink-0 px-0" aria-label="ปิด">
              <X className="size-4" />
            </DialogPrimitive.Close>
          </div>

          {open && hasPin ? (
            <HuntMap
              compact
              hostClassName="h-[42vh] min-h-[220px] w-full bg-[var(--hh-surface)]"
              pins={[
                {
                  id: project.id,
                  name: project.name,
                  lat: project.lat as string,
                  lng: project.lng as string,
                  priceLabel: formatPriceRange(project.priceStartSatang, project.priceMaxSatang, project.unitCheck),
                  kind: "project",
                  traffic: project.traffic,
                },
              ]}
            />
          ) : null}

          <p className="mt-3 text-sm">
            <span className="text-[var(--hh-muted)]">ที่อยู่ / โซน </span>
            {project.zone}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {hasPin ? (
              <a
                href={googleMapsHref(project.lat as string, project.lng as string)}
                target="_blank"
                rel="noreferrer"
                className="hh-btn hh-btn-ghost h-9"
              >
                เปิด Google Maps
              </a>
            ) : null}
            <Link href={`/family/hunt/${project.id}`} className="hh-btn h-9">
              ดูรายละเอียด
            </Link>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
