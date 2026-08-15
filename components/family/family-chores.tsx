"use client";

import { Check, ListTodo } from "lucide-react";
import {
  createFamilyChore,
  deleteFamilyChore,
  toggleFamilyChore,
} from "@/app/(app)/family/actions";
import { ConfirmDelete } from "@/components/notebook/confirm-delete";
import { RecordList, RecordRow } from "@/components/notebook/record-row";
import { ToggleAction } from "@/components/notebook/toggle-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Chore = {
  id: string;
  title: string;
  dueOn: string | null;
  done: boolean;
  assigneeId: string | null;
};

export function FamilyChoresPanel({
  items,
  members,
}: {
  items: Chore[];
  members: { userId: string; name: string }[];
}) {
  const names = Object.fromEntries(members.map((m) => [m.userId, m.name]));
  return (
    <div className="grid gap-4">
      <form action={createFamilyChore} className="df-card grid gap-2 p-3 sm:grid-cols-[1fr_auto_auto_auto]">
        <Input name="title" placeholder="งานบ้าน…" required />
        <Input name="dueOn" type="date" className="min-w-[9rem]" />
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
        <Button type="submit">เพิ่ม</Button>
      </form>
      {items.length === 0 ? (
        <p className="text-caption">ยังไม่มีงาน</p>
      ) : (
        <RecordList>
          {items.map((c) => (
            <RecordRow
              key={c.id}
              flush
              done={c.done}
              title={c.title}
              leading={<ListTodo className="size-5 text-kaffir" strokeWidth={2.1} />}
              hint={[c.dueOn ? `ครบ ${c.dueOn}` : null, c.assigneeId ? names[c.assigneeId] : null]
                .filter(Boolean)
                .join(" · ")}
              tag={c.done ? <Check className="size-4 text-kaffir" strokeWidth={2.2} /> : null}
              actions={
                <div className="flex items-center gap-1">
                  <ToggleAction
                    action={toggleFamilyChore}
                    id={c.id}
                    name="done"
                    value={c.done ? "0" : "1"}
                    label={c.done ? "ยังไม่เสร็จ" : "เสร็จ"}
                  />
                  <ConfirmDelete action={deleteFamilyChore} id={c.id} />
                </div>
              }
            />
          ))}
        </RecordList>
      )}
    </div>
  );
}
