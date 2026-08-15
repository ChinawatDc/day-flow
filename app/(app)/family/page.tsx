import { Home, UserPlus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { JoinPanel } from "@/components/family/join-panel";
import { ComposerSheet } from "@/components/notebook/composer-sheet";
import { OverviewCard } from "@/components/notebook/overview-card";
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
  searchParams: Promise<{ err?: string }>;
}) {
  const user = await requireUser();
  const m = await getMembership(user.id);
  const { err } = await searchParams;
  if (!m) {
    return (
      <AppShell title="ครอบครัว">
        <div className="mb-5 grid grid-cols-2 gap-3">
          <OverviewCard
            tone="kaffir"
            title="สร้าง"
            value={<Home className="size-8 text-surface" aria-hidden />}
          />
          <OverviewCard
            title="เข้าร่วม"
            value={<UserPlus className="size-8 text-kaffir" aria-hidden />}
          />
        </div>
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
    <FamilyHome
      userId={user.id}
      familyId={m.familyId}
      name={m.name}
      joinCode={m.joinCode}
      role={m.role}
    />
  );
}
