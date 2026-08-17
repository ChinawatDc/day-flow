import { Download, KeyRound, Link2, LogOut, Trash2, UserRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ChangePasswordForm } from "@/components/change-password-form";
import { ConfirmDelete } from "@/components/notebook/confirm-delete";
import { SectionCard } from "@/components/notebook/section-card";
import { SignOutButton } from "@/components/sign-out-button";
import { Button } from "@/components/ui/button";
import { getDb } from "@/lib/db/client";
import { user } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { requireUser } from "@/lib/session";
import { eq } from "drizzle-orm";
import { deleteAccount, unlinkLine } from "./actions";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string }>;
}) {
  const sessionUser = await requireUser();
  const { err } = await searchParams;
  const [row] = await getDb().select().from(user).where(eq(user.id, sessionUser.id)).limit(1);
  const initial = (sessionUser.name || sessionUser.email || "?").slice(0, 1).toUpperCase();
  const lineOn = env.lineLoginConfigured;
  const linked = Boolean(row?.lineUserId);

  return (
    <AppShell title="ตั้งค่า">
      <section className="df-card mb-5 flex items-center gap-4 p-5">
        <div className="grid size-14 place-items-center rounded-full bg-kaffir text-xl font-bold text-surface">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="text-caption flex items-center gap-1.5">
            <UserRound className="size-3.5" />
            บัญชี
          </p>
          <p className="truncate text-title text-lg">{sessionUser.name || "ไม่มีชื่อ"}</p>
          <p className="text-caption truncate">{sessionUser.email}</p>
        </div>
      </section>

      {err === "lineused" ? (
        <p className="mb-3 rounded-[var(--radius-md)] bg-orange-soft px-3 py-2 text-sm text-orange">
          LINE นี้ผูกบัญชีอื่นแล้ว
        </p>
      ) : err === "line" ? (
        <p className="mb-3 rounded-[var(--radius-md)] bg-orange-soft px-3 py-2 text-sm text-orange">เชื่อม LINE ไม่สำเร็จ</p>
      ) : null}

      <div className="grid gap-3 md:max-w-xl">
        <SectionCard icon={<KeyRound className="size-5" />} title="รหัสผ่าน">
          <ChangePasswordForm />
        </SectionCard>

        {lineOn ? (
          <SectionCard icon={<Link2 className="size-5" />} title="LINE">
            {linked ? (
              <form action={unlinkLine}>
                <p className="text-caption mb-3">ผูกแล้ว — แฟนจะได้รับการ์ดเมื่อมี shortlist/นัดดู</p>
                <Button type="submit" variant="outline">
                  ยกเลิกการผูก
                </Button>
              </form>
            ) : (
              <Button asChild variant="outline">
                <a href="/api/line/login?link=1&next=/settings">เชื่อม LINE</a>
              </Button>
            )}
          </SectionCard>
        ) : null}

        <SectionCard icon={<Download className="size-5" />} title="สำรองข้อมูล">
          <div className="grid gap-2">
            <ExportLink href="/api/export?format=json" label="JSON ทั้งบัญชี" />
            <ExportLink href="/api/export?format=csv&kind=money" label="CSV รายจ่าย" />
            <ExportLink href="/api/export?format=csv&kind=tasks" label="CSV งาน" />
          </div>
        </SectionCard>

        <SectionCard icon={<LogOut className="size-5" />} title="เซสชัน">
          <SignOutButton />
        </SectionCard>

        <SectionCard icon={<Trash2 className="size-5" />} title="โซนอันตราย" danger>
          <ConfirmDelete
            action={deleteAccount}
            id="self"
            name="confirm"
            label="ลบบัญชีถาวร"
            message="ลบบัญชีและไฟล์ทั้งหมด?"
          />
        </SectionCard>
      </div>
    </AppShell>
  );
}

function ExportLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="df-press df-glass flex items-center justify-between rounded-[var(--radius-md)] px-3 py-3 text-sm font-medium hover:border-kaffir"
    >
      {label}
      <Download className="size-4 text-kaffir" />
    </a>
  );
}
