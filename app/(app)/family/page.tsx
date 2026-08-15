import { Home, UserPlus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { JoinPanel } from "@/components/family/join-panel";
import { ComposerSheet } from "@/components/notebook/composer-sheet";
import { StatStrip } from "@/components/notebook/stat-strip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createFamily } from "./actions";
import { FamilyHome } from "./family-home";
import { getMembership } from "@/lib/family/data";
import { requireUser } from "@/lib/session";

export default async function FamilyPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string; tab?: string; sub?: string }>;
}) {
  const user = await requireUser();
  const m = await getMembership(user.id);
  const { err, tab, sub } = await searchParams;
  if (!m) {
    return (
      <AppShell title="ครอบครัว">
        <StatStrip
          items={[
            {
              label: "สร้าง",
              value: <Home className="size-7 text-surface" aria-hidden />,
              emphasize: true,
            },
            {
              label: "เข้าร่วม",
              value: <UserPlus className="size-7 text-kaffir" aria-hidden />,
            },
          ]}
        />
        <div className="grid gap-3">
          <ComposerSheet label="สร้างครอบครัว" title="บ้านใหม่">
            <form action={createFamily} className="grid gap-3">
              <Label htmlFor="name">ชื่อครอบครัว</Label>
              <Input id="name" name="name" placeholder="บ้านเรา" />
              <Button type="submit">สร้าง</Button>
            </form>
          </ComposerSheet>
          <ComposerSheet label="เข้าร่วม" title="เข้าด้วยโค้ดหรือ QR" variant="outline">
            <JoinPanel error={err} />
          </ComposerSheet>
        </div>
      </AppShell>
    );
  }

  return (
    <>
      {err ? (
        <div className="mx-auto w-full max-w-lg px-4 pt-3">
          <p className="text-caption rounded-[var(--radius-md)] bg-orange-soft px-3 py-2 text-orange">{err}</p>
        </div>
      ) : null}
      <FamilyHome
        userId={user.id}
        familyId={m.familyId}
        name={m.name}
        joinCode={m.joinCode}
        joinCodeExpiresAt={m.joinCodeExpiresAt}
        role={m.role}
        tab={tab}
        sub={sub}
      />
    </>
  );
}
