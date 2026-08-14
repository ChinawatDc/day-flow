import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { getTodaySnapshot } from "@/lib/data";
import { requireUser } from "@/lib/session";
import { isoToThaiDisplay } from "@/lib/thai-date";
import { bahtFromSatang } from "@/lib/utils";

export default async function TodayPage() {
  const user = await requireUser();
  const snap = await getTodaySnapshot(user.id);

  return (
    <AppShell title="วันนี้">
      <p className="mb-6 text-ink-muted">{isoToThaiDisplay(snap.today)}</p>
      <div className="grid gap-3 md:grid-cols-12">
        <section className="rounded-xl bg-kaffir p-5 text-paper md:col-span-7">
          <p className="text-sm text-paper/80">ยอดจ่ายวันนี้</p>
          <p className="font-display tabular mt-2 text-5xl">฿{bahtFromSatang(snap.spentToday)}</p>
          <Link href="/money" className="mt-4 inline-block text-sm underline">
            ไปโมดูลเงิน
          </Link>
        </section>
        <section className="rounded-xl border border-line bg-paper-2 p-5 md:col-span-5">
          <p className="font-display text-xl">ค้างจัด</p>
          <p className="mt-2 text-3xl tabular">{snap.unfiledCount}</p>
          <p className="text-sm text-ink-muted">รายการในจดด่วน</p>
          <Link href="/inbox" className="mt-3 inline-block text-sm text-kaffir underline">
            จัด Inbox
          </Link>
        </section>
        <section className="rounded-xl border border-line p-5 md:col-span-7">
          <div className="flex items-baseline justify-between">
            <p className="font-display text-xl">งานวันนี้</p>
            <Link href="/tasks" className="text-sm text-kaffir underline">
              ทั้งหมด
            </Link>
          </div>
          <ul className="mt-4 grid gap-2">
            {snap.openTasks.length === 0 ? (
              <li className="text-sm text-ink-muted">ไม่มีงานค้างที่ครบวันนี้</li>
            ) : (
              snap.openTasks.map((t) => (
                <li key={t.id} className="rounded-lg bg-paper-2 px-3 py-2">
                  {t.title}
                </li>
              ))
            )}
          </ul>
        </section>
        <section className="rounded-xl border border-line p-5 md:col-span-5">
          <p className="font-display text-xl">บันทึกวัน</p>
          <p className="mt-2 text-ink-muted">
            {snap.hasJournal ? "เขียนแล้ววันนี้" : "ยังไม่ได้เขียน"}
          </p>
          <Link href="/journal" className="mt-3 inline-block text-sm text-kaffir underline">
            เปิดบันทึก
          </Link>
          {snap.expiring.length > 0 ? (
            <p className="mt-4 text-sm text-orange">
              เอกสารใกล้หมดอายุ {snap.expiring.length} รายการ
            </p>
          ) : null}
        </section>
      </div>
    </AppShell>
  );
}
