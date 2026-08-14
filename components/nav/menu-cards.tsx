"use client";

import Link from "next/link";
import { modules, settingsModule } from "@/lib/modules";
import { cn } from "@/lib/utils";
import { SheetClose } from "@/components/ui/sheet";

const items = [...modules, settingsModule];

export function MenuCards({ closeOnClick = false }: { closeOnClick?: boolean }) {
  const grid = (
    <div className="grid grid-cols-2 gap-3 pb-4">
      {items.map((m) => {
        const Icon = m.icon;
        const card = (
          <span className="flex h-full min-h-24 flex-col justify-between rounded-xl border border-line bg-paper-2 p-3 hover:bg-paper-3">
            <Icon className="size-5 text-kaffir" />
            <span>
              <span className="text-title block text-base">{m.label}</span>
              <span className="text-caption mt-0.5 block">{m.blurb}</span>
            </span>
          </span>
        );
        if (closeOnClick) {
          return (
            <SheetClose asChild key={m.id}>
              <Link href={m.href}>{card}</Link>
            </SheetClose>
          );
        }
        return (
          <Link key={m.id} href={m.href} className={cn("block")}>
            {card}
          </Link>
        );
      })}
    </div>
  );
  return grid;
}
