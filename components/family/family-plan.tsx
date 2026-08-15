"use client";

import { useMemo, useState } from "react";
import { ChapterTabs } from "@/components/notebook/chapter-tabs";
import { FamilyAppointmentsPanel, type FamilyAppt } from "@/components/family/family-appointments";
import { FamilyChoresPanel } from "@/components/family/family-chores";
import { FamilyShoppingPanel } from "@/components/family/family-shopping";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createFamilyAppointment,
  createFamilyChore,
  createFamilyShopping,
} from "@/app/(app)/family/actions";
import { isoMonthThai, isoToThaiDisplay } from "@/lib/thai-date";
import { addDaysIso, bangkokIsoFromDate, bangkokTodayIso, cn } from "@/lib/utils";

type Chore = {
  id: string;
  title: string;
  dueOn: string | null;
  done: boolean;
  assigneeId: string | null;
};

type Shop = {
  id: string;
  name: string;
  bought: boolean;
  shopOn: string | null;
  assigneeId: string | null;
};

type Member = { userId: string; name: string };

const WEEK = ["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"];

function monthCells(ym: string) {
  const first = `${ym}-01`;
  const js = new Date(`${first}T12:00:00+07:00`).getDay();
  const mondayPad = (js + 6) % 7;
  const start = addDaysIso(first, -mondayPad);
  return Array.from({ length: 42 }, (_, i) => addDaysIso(start, i));
}

function shiftMonth(ym: string, delta: number) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function FamilyPlan({
  sub,
  chores,
  shopping,
  appointments,
  members,
}: {
  sub?: string;
  chores: Chore[];
  shopping: Shop[];
  appointments: FamilyAppt[];
  members: Member[];
}) {
  const today = bangkokTodayIso();
  const [ym, setYm] = useState(today.slice(0, 7));
  const [day, setDay] = useState(today);
  const names = Object.fromEntries(members.map((m) => [m.userId, m.name]));
  const cells = useMemo(() => monthCells(ym), [ym]);
  const planSub = ["month", "chores", "shop", "appt"].includes(sub ?? "") ? sub : "month";

  const marks = useMemo(() => {
    const map = new Map<string, { chore: boolean; shop: boolean; appt: boolean }>();
    const bump = (iso: string | null, kind: "chore" | "shop" | "appt") => {
      if (!iso) return;
      const cur = map.get(iso) ?? { chore: false, shop: false, appt: false };
      cur[kind] = true;
      map.set(iso, cur);
    };
    for (const c of chores) bump(c.dueOn, "chore");
    for (const s of shopping) bump(s.shopOn, "shop");
    for (const a of appointments) bump(bangkokIsoFromDate(a.startsAt), "appt");
    return map;
  }, [chores, shopping, appointments]);

  const dayRows = [
    ...chores
      .filter((c) => c.dueOn === day)
      .map((c) => ({
        key: `c-${c.id}`,
        kind: "งาน",
        title: c.title,
        who: c.assigneeId ? names[c.assigneeId] : "—",
        status: c.done ? "เสร็จ" : "ค้าง",
        time: "—",
      })),
    ...shopping
      .filter((s) => s.shopOn === day)
      .map((s) => ({
        key: `s-${s.id}`,
        kind: "ซื้อของ",
        title: s.name,
        who: s.assigneeId ? names[s.assigneeId] : "—",
        status: s.bought ? "ซื้อแล้ว" : "รอซื้อ",
        time: "—",
      })),
    ...appointments
      .filter((a) => bangkokIsoFromDate(a.startsAt) === day)
      .map((a) => ({
        key: `a-${a.id}`,
        kind: "นัด",
        title: a.title,
        who: a.assigneeId ? names[a.assigneeId] : "—",
        status: a.place || "—",
        time: new Date(a.startsAt).toLocaleTimeString("th-TH", {
          timeZone: "Asia/Bangkok",
          hour: "2-digit",
          minute: "2-digit",
        }),
      })),
  ];

  const monthChores = chores.filter((c) => c.dueOn?.startsWith(ym));
  const monthShop = shopping.filter((s) => s.shopOn?.startsWith(ym));
  const undatedShop = shopping.filter((s) => !s.shopOn);
  const monthAppt = appointments.filter((a) => bangkokIsoFromDate(a.startsAt).startsWith(ym));

  return (
    <ChapterTabs
      param="sub"
      value={planSub}
      items={[
        { key: "month", label: "เดือน" },
        { key: "chores", label: "งาน" },
        { key: "shop", label: "ซื้อของ" },
        { key: "appt", label: "นัดหมาย" },
      ]}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
        <div className="df-card p-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setYm(shiftMonth(ym, -1))}>
              ก่อน
            </Button>
            <p className="text-title text-[1.05rem]">{isoMonthThai(ym)}</p>
            <Button type="button" variant="outline" size="sm" onClick={() => setYm(shiftMonth(ym, 1))}>
              ถัดไป
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-px text-center">
            {WEEK.map((w) => (
              <div key={w} className="text-caption py-1">
                {w}
              </div>
            ))}
            {cells.map((iso) => {
              const inMonth = iso.startsWith(ym);
              const mark = marks.get(iso);
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => {
                    setDay(iso);
                    if (!iso.startsWith(ym)) setYm(iso.slice(0, 7));
                  }}
                  className={cn(
                    "df-press min-h-11 rounded-[var(--radius-md)] px-0.5 py-1 text-sm",
                    iso === day && "bg-kaffir text-surface",
                    iso !== day && iso === today && "bg-kaffir-soft",
                    iso !== day && !inMonth && "text-ink-faint",
                  )}
                >
                  {Number(iso.slice(8))}
                  <span className="mt-0.5 flex justify-center gap-0.5">
                    {mark?.chore ? <i className={cn("size-1.5 rounded-full", iso === day ? "bg-surface" : "bg-kaffir")} /> : null}
                    {mark?.shop ? <i className={cn("size-1.5 rounded-full", iso === day ? "bg-surface/80" : "bg-orange")} /> : null}
                    {mark?.appt ? <i className={cn("size-1.5 rounded-full", iso === day ? "bg-surface/60" : "bg-ink")} /> : null}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid gap-3">
          <p className="text-title">{isoToThaiDisplay(day)}</p>
          <form action={createFamilyChore} className="df-card grid gap-2 p-3">
            <input type="hidden" name="dueOn" value={day} />
            <p className="text-caption">เพิ่มงานวันนี้</p>
            <div className="flex flex-wrap gap-2">
              <Input name="title" placeholder="งานบ้าน…" required className="min-w-[8rem] flex-1" />
              <MemberSelect members={members} />
              <Button type="submit" size="sm">
                เพิ่มงาน
              </Button>
            </div>
          </form>
          <form action={createFamilyShopping} className="df-card grid gap-2 p-3">
            <input type="hidden" name="shopOn" value={day} />
            <p className="text-caption">เพิ่มของที่จะซื้อวันนี้</p>
            <div className="flex flex-wrap gap-2">
              <Input name="name" placeholder="ของ…" required className="min-w-[8rem] flex-1" />
              <MemberSelect members={members} />
              <Button type="submit" size="sm">
                เพิ่มของ
              </Button>
            </div>
          </form>
          <form action={createFamilyAppointment} className="df-card grid gap-2 p-3">
            <p className="text-caption">เพิ่มนัดวันนี้</p>
            <Input name="title" placeholder="นัดหมาย…" required />
            <Input name="startsAt" type="datetime-local" required defaultValue={`${day}T09:00`} key={day} />
            <Input name="place" placeholder="สถานที่" />
            <div className="flex flex-wrap gap-2">
              <MemberSelect members={members} />
              <Button type="submit" size="sm">
                เพิ่มนัด
              </Button>
            </div>
          </form>
          {dayRows.length === 0 ? (
            <p className="text-caption">วันนี้ยังว่าง</p>
          ) : (
            <div className="df-card overflow-x-auto p-0">
              <table className="w-full min-w-[22rem] text-left text-sm">
                <thead>
                  <tr className="text-caption border-b border-[var(--stroke)]">
                    <th className="px-3 py-2 font-medium">เวลา</th>
                    <th className="px-3 py-2 font-medium">รายการ</th>
                    <th className="px-3 py-2 font-medium">ชนิด</th>
                    <th className="px-3 py-2 font-medium">คน</th>
                    <th className="px-3 py-2 font-medium">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {dayRows.map((r) => (
                    <tr key={r.key} className="border-b border-[var(--stroke)] last:border-0">
                      <td className="px-3 py-2 whitespace-nowrap">{r.time}</td>
                      <td className="px-3 py-2">{r.title}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{r.kind}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{r.who}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <FamilyChoresPanel items={monthChores} members={members} defaultDay={day} />
      <div className="grid gap-6">
        <FamilyShoppingPanel items={monthShop} members={members} defaultDay={day} />
        {undatedShop.length > 0 ? (
          <div>
            <p className="text-caption mb-2">ยังไม่ลงวัน</p>
            <FamilyShoppingPanel items={undatedShop} members={members} />
          </div>
        ) : null}
      </div>
      <FamilyAppointmentsPanel items={monthAppt} members={members} defaultDay={day} />
    </ChapterTabs>
  );
}

function MemberSelect({ members }: { members: Member[] }) {
  return (
    <select
      name="assigneeId"
      className="h-11 min-w-[7rem] rounded-[var(--radius-md)] border border-[var(--glass-line)] bg-[color-mix(in_oklch,var(--surface-solid)_70%,transparent)] px-2 text-sm backdrop-blur-[10px]"
      defaultValue=""
    >
      <option value="">ไม่ระบุคน</option>
      {members.map((m) => (
        <option key={m.userId} value={m.userId}>
          {m.name}
        </option>
      ))}
    </select>
  );
}
