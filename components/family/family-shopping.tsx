"use client";

import { Check, ShoppingCart } from "lucide-react";
import {
  createFamilyShopping,
  deleteFamilyShopping,
  toggleFamilyShopping,
} from "@/app/(app)/family/actions";
import { ConfirmDelete } from "@/components/notebook/confirm-delete";
import { RecordList, RecordRow } from "@/components/notebook/record-row";
import { ToggleAction } from "@/components/notebook/toggle-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Item = {
  id: string;
  name: string;
  bought: boolean;
  assigneeId: string | null;
};

export function FamilyShoppingPanel({
  items,
  members,
}: {
  items: Item[];
  members: { userId: string; name: string }[];
}) {
  const names = Object.fromEntries(members.map((m) => [m.userId, m.name]));
  return (
    <div className="grid gap-4">
      <form action={createFamilyShopping} className="df-card flex flex-wrap gap-2 p-2">
        <Input name="name" placeholder="ของที่ต้องซื้อ…" required className="min-w-[10rem] flex-1" />
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
        <Button type="submit" className="shrink-0">
          เพิ่ม
        </Button>
      </form>
      {items.length === 0 ? (
        <p className="text-caption">ยังไม่มีรายการ</p>
      ) : (
        <RecordList>
          {items.map((s) => (
            <RecordRow
              key={s.id}
              flush
              done={s.bought}
              title={s.name}
              leading={<ShoppingCart className="size-5 text-kaffir" strokeWidth={2.1} />}
              hint={s.assigneeId ? names[s.assigneeId] : undefined}
              tag={s.bought ? <Check className="size-4 text-kaffir" strokeWidth={2.2} /> : null}
              actions={
                <div className="flex items-center gap-1">
                  <ToggleAction
                    action={toggleFamilyShopping}
                    id={s.id}
                    name="bought"
                    value={s.bought ? "0" : "1"}
                    label={s.bought ? "ยังไม่ซื้อ" : "ซื้อแล้ว"}
                  />
                  <ConfirmDelete action={deleteFamilyShopping} id={s.id} />
                </div>
              }
            />
          ))}
        </RecordList>
      )}
    </div>
  );
}
