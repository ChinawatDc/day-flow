"use client";

import { CalendarClock } from "lucide-react";
import {
  createFamilyAppointment,
  deleteFamilyAppointment,
} from "@/app/(app)/family/actions";
import { ConfirmDelete } from "@/components/notebook/confirm-delete";
import { RecordList, RecordRow } from "@/components/notebook/record-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isoToThaiShort } from "@/lib/thai-date";
import { bangkokIsoFromDate } from "@/lib/utils";

export type FamilyAppt = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string | null;
  place: string;
  assigneeId: string | null;
};

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString("th-TH", {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function FamilyAppointmentsPanel({
  items,
  members,
  defaultDay,
}: {
  items: FamilyAppt[];
  members: { userId: string; name: string }[];
  defaultDay?: string;
}) {
  const names = Object.fromEntries(members.map((m) => [m.userId, m.name]));
  return (
    <div className="grid gap-4">
      <form action={createFamilyAppointment} className="df-card grid gap-2 p-3 sm:grid-cols-2">
        <Input name="title" placeholder="นัดหมาย…" required className="sm:col-span-2" />
        <Input name="startsAt" type="datetime-local" required defaultValue={defaultDay ? `${defaultDay}T09:00` : undefined} />
        <Input name="endsAt" type="datetime-local" />
        <Input name="place" placeholder="สถานที่" />
        <select
          name="assigneeId"
          className="h-11 rounded-[var(--radius-md)] border border-[var(--glass-line)] bg-[color-mix(in_oklch,var(--surface-solid)_70%,transparent)] px-2 text-sm backdrop-blur-[10px]"
          defaultValue=""
        >
          <option value="">ไม่ระบุคน</option>
          {members.map((m) => (
            <option key={m.userId} value={m.userId}>
              {m.name}
            </option>
          ))}
        </select>
        <Button type="submit" className="sm:col-span-2">
          เพิ่มนัด
        </Button>
      </form>
      {items.length === 0 ? (
        <p className="text-caption">ยังไม่มีนัด</p>
      ) : (
        <RecordList>
          {items.map((a) => (
            <RecordRow
              key={a.id}
              flush
              title={a.title}
              leading={<CalendarClock className="size-5 text-kaffir" strokeWidth={2.1} />}
              hint={[
                `${isoToThaiShort(bangkokIsoFromDate(a.startsAt))} ${timeLabel(a.startsAt)}`,
                a.place || null,
                a.assigneeId ? names[a.assigneeId] : null,
              ]
                .filter(Boolean)
                .join(" · ")}
              actions={<ConfirmDelete action={deleteFamilyAppointment} id={a.id} />}
            />
          ))}
        </RecordList>
      )}
    </div>
  );
}
