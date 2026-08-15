import { Download, KeyRound, LogOut, Trash2, UserRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ChangePasswordForm } from "@/components/change-password-form";
import { ConfirmDelete } from "@/components/notebook/confirm-delete";
import { SectionCard } from "@/components/notebook/section-card";
import { SignOutButton } from "@/components/sign-out-button";
import { requireUser } from "@/lib/session";
import { deleteAccount } from "./actions";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <AppShell title="ตั้งค่า">
      <section className="mb-5 overflow-hidden rounded-[1.5rem] border border-line bg-gradient-to-br from-paper to-paper-2 p-5 shadow-[0_12px_32px_rgba(28,25,23,0.05)]">
        <div className="flex items-center gap-4">
          <div className="grid size-14 place-items-center rounded-full bg-kaffir text-xl font-bold text-paper">
            {(user.name || user.email || "?").slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-caption flex items-center gap-1.5">
              <UserRound className="size-3.5" />
              บัญชี
            </p>
            <p className="truncate text-title text-lg">{user.name || "ไม่มีชื่อ"}</p>
            <p className="text-caption truncate">{user.email}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-3 md:max-w-xl">
        <SectionCard icon={<KeyRound className="size-5" />} title="รหัสผ่าน" hint="เปลี่ยนรหัสเข้าใช้บัญชีนี้">
          <ChangePasswordForm />
        </SectionCard>

        <SectionCard icon={<Download className="size-5" />} title="สำรองข้อมูล" hint="ดาวน์โหลดเฉพาะข้อมูลบัญชีนี้">
          <div className="grid gap-2">
            <ExportLink href="/api/export?format=json" label="JSON ทั้งบัญชี" />
            <ExportLink href="/api/export?format=csv&kind=money" label="CSV รายจ่าย" />
            <ExportLink href="/api/export?format=csv&kind=tasks" label="CSV งาน" />
          </div>
        </SectionCard>

        <SectionCard icon={<LogOut className="size-5" />} title="เซสชัน" hint="ออกจากระบบบนเครื่องนี้">
          <SignOutButton />
        </SectionCard>

        <SectionCard
          icon={<Trash2 className="size-5" />}
          title="โซนอันตราย"
          hint="ลบข้อมูลและไฟล์ของบัญชีนี้ถาวร"
          danger
        >
          <p className="text-caption mb-3">เมลเดิมสมัครใหม่ได้หลังลบ</p>
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
      className="flex items-center justify-between rounded-xl border border-line bg-paper-2 px-3 py-3 text-sm font-medium transition-colors hover:border-kaffir hover:bg-paper"
    >
      {label}
      <Download className="size-4 text-kaffir" />
    </a>
  );
}
