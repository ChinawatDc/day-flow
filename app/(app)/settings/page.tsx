import { AppShell } from "@/components/app-shell";
import { ChangePasswordForm } from "@/components/change-password-form";
import { ConfirmDelete } from "@/components/notebook/confirm-delete";
import { requireUser } from "@/lib/session";
import { deleteAccount } from "./actions";

export default async function SettingsPage() {
  await requireUser();
  return (
    <AppShell title="ตั้งค่า">
      <section className="mb-10 md:max-w-xl">
        <h2 className="text-title mb-4">เปลี่ยนรหัสผ่าน</h2>
        <ChangePasswordForm />
      </section>
      <section className="mb-10 md:max-w-xl">
        <h2 className="text-title mb-4">ส่งออกข้อมูล</h2>
        <p className="text-caption mb-3">เฉพาะข้อมูลบัญชีนี้</p>
        <div className="flex flex-wrap gap-3">
          <a className="text-sm text-kaffir underline" href="/api/export?format=json">
            ดาวน์โหลด JSON
          </a>
          <a className="text-sm text-kaffir underline" href="/api/export?format=csv&kind=money">
            CSV เงิน
          </a>
          <a className="text-sm text-kaffir underline" href="/api/export?format=csv&kind=tasks">
            CSV งาน
          </a>
        </div>
      </section>
      <section className="md:max-w-xl">
        <h2 className="text-title mb-4">ลบบัญชี</h2>
        <p className="text-caption mb-3">ลบข้อมูลและไฟล์ของบัญชีนี้ เมลเดิมสมัครใหม่ได้</p>
        <ConfirmDelete
          action={deleteAccount}
          id="self"
          name="confirm"
          label="ลบบัญชีถาวร"
          message="ลบบัญชีและไฟล์ทั้งหมด?"
        />
      </section>
    </AppShell>
  );
}
