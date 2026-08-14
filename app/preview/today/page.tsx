import Link from "next/link";

export default function PreviewTodayPage() {
  return (
    <div className="grid gap-3 md:grid-cols-12">
      <section className="rounded-xl bg-kaffir p-5 text-paper md:col-span-7">
        <p className="text-sm text-paper/80">ยอดจ่ายวันนี้</p>
        <p className="font-display tabular mt-2 text-5xl">฿420</p>
        <Link href="/preview/money" className="mt-4 inline-block text-sm underline">
          ไปโมดูลเงิน
        </Link>
      </section>
      <section className="rounded-xl border border-line bg-paper-2 p-5 md:col-span-5">
        <p className="font-display text-xl">ค้างจัด</p>
        <p className="mt-2 text-3xl tabular">2</p>
        <p className="text-sm text-ink-muted">รายการในจดด่วน</p>
      </section>
      <section className="rounded-xl border border-line p-5 md:col-span-7">
        <p className="font-display text-xl">งานวันนี้</p>
        <ul className="mt-4 grid gap-2">
          <li className="rounded-lg bg-paper-2 px-3 py-2">จ่ายค่าเน็ต</li>
          <li className="rounded-lg bg-paper-2 px-3 py-2">ซื้อนม</li>
        </ul>
      </section>
      <section className="rounded-xl border border-line p-5 md:col-span-5">
        <p className="font-display text-xl">บันทึกวัน</p>
        <p className="mt-2 text-ink-muted">ยังไม่ได้เขียน</p>
      </section>
    </div>
  );
}
