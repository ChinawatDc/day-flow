"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { modules } from "@/lib/modules";
import { cn } from "@/lib/utils";

const spans: Record<string, string> = {
  today: "col-span-2 min-h-40 md:col-span-4 md:min-h-48",
  inbox: "col-span-1 min-h-32 md:col-span-2",
  tasks: "col-span-1 min-h-32 md:col-span-2",
  money: "col-span-2 min-h-28 md:col-span-3",
  vault: "col-span-1 md:col-span-3",
  home: "col-span-1 md:col-span-2",
  journal: "col-span-2 md:col-span-4",
};

export function HubGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-6 md:gap-4">
      {modules.map((m, i) => {
        const Icon = m.icon;
        const accent = m.id === "money" || m.id === "vault" ? "orange" : "kaffir";
        return (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.28 }}
            className={spans[m.id]}
          >
            <Link
              href={m.href}
              className={cn(
                "flex h-full flex-col justify-between rounded-xl border border-line p-4 md:p-5",
                accent === "orange" ? "bg-orange-soft/40" : "bg-paper-2",
                m.id === "today" && "bg-kaffir text-paper",
              )}
            >
              <Icon className={cn("size-6", m.id === "today" ? "text-paper" : "text-kaffir")} />
              <div>
                <p className="font-display text-2xl md:text-3xl">{m.label}</p>
                <p
                  className={cn(
                    "mt-1 text-sm",
                    m.id === "today" ? "text-paper/80" : "text-ink-muted",
                  )}
                >
                  {m.blurb}
                </p>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
