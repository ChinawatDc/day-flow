export default function PreviewMoneyPage() {
  return (
    <div>
      <div className="mb-8 grid gap-3 md:grid-cols-12">
        <section className="rounded-xl bg-orange p-5 text-paper md:col-span-7">
          <p className="text-sm text-paper/80">วันนี้</p>
          <p className="font-display tabular mt-1 text-4xl">฿420</p>
        </section>
        <section className="rounded-xl border border-line bg-paper-2 p-5 md:col-span-5">
          <p className="text-sm text-ink-muted">เดือนนี้</p>
          <p className="font-display tabular mt-1 text-4xl">฿8,240</p>
        </section>
      </div>
      <ul className="grid gap-3 lg:hidden">
        <li className="rounded-xl border border-line p-4">
          <p className="font-display tabular text-2xl">฿120</p>
          <p className="text-sm text-ink-muted">อาหาร · ก๋วยเตี๋ยว</p>
        </li>
        <li className="rounded-xl border border-line p-4">
          <p className="font-display tabular text-2xl">฿300</p>
          <p className="text-sm text-ink-muted">เดินทาง · BTS</p>
        </li>
      </ul>
      <div className="hidden lg:block">
        <table className="w-full text-left">
          <thead className="border-b border-line text-sm text-ink-muted">
            <tr>
              <th className="py-2">จำนวน</th>
              <th>หมวด</th>
              <th>ร้าน</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-line/70">
              <td className="font-display tabular py-3">฿120</td>
              <td>อาหาร</td>
              <td>ก๋วยเตี๋ยว</td>
            </tr>
            <tr className="border-b border-line/70">
              <td className="font-display tabular py-3">฿300</td>
              <td>เดินทาง</td>
              <td>BTS</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
