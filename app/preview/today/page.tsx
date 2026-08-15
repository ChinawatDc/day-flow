import Link from "next/link";
import { AmountText } from "@/components/notebook/amount-text";
import { StatStrip } from "@/components/notebook/stat-strip";

export default function PreviewTodayPage() {
  return (
    <div className="df-canvas min-h-dvh p-4 md:p-8">
      <StatStrip
        items={[
          { label: "จ่าย", value: <AmountText satang={42000} />, emphasize: true },
          { label: "ค้างจัด", value: "2", href: "/preview/money" },
        ]}
      />
      <div className="grid gap-3 md:grid-cols-2">
        <section className="df-card p-5">
          <p className="text-title text-xl">งานวันนี้</p>
          <ul className="mt-4 grid gap-2">
            <li className="df-glass rounded-[var(--radius-md)] px-3 py-2">จ่ายค่าเน็ต</li>
            <li className="df-glass rounded-[var(--radius-md)] px-3 py-2">ซื้อนม</li>
          </ul>
        </section>
        <section className="df-card p-5">
          <p className="text-title text-xl">บันทึกวัน</p>
          <p className="mt-2 text-ink-muted">ยังไม่ได้เขียน</p>
          <Link href="/preview/money" className="mt-4 inline-block text-sm text-kaffir underline">
            ไปโมดูลเงิน
          </Link>
        </section>
      </div>
    </div>
  );
}
