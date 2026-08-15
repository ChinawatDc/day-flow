import { AmountText } from "@/components/notebook/amount-text";
import { RecordList, RecordRow, SoftTag } from "@/components/notebook/record-row";
import { StatStrip } from "@/components/notebook/stat-strip";

export default function PreviewMoneyPage() {
  return (
    <div className="df-canvas min-h-dvh p-4 md:p-8">
      <StatStrip
        items={[
          { label: "วันนี้", value: <AmountText satang={42000} />, emphasize: true },
          { label: "เดือนนี้", value: <AmountText satang={824000} /> },
        ]}
      />
      <RecordList>
        <RecordRow
          flush
          title="ก๋วยเตี๋ยว"
          value={<AmountText satang={12000} />}
          tag={<SoftTag tone="kaffir">อาหาร</SoftTag>}
        />
        <RecordRow
          flush
          title="BTS"
          value={<AmountText satang={30000} />}
          tag={<SoftTag tone="kaffir">เดินทาง</SoftTag>}
        />
      </RecordList>
    </div>
  );
}
