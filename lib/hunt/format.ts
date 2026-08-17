/** ล้านบาท → สตางค์ (integer) */
export function satangFromMillion(million: number) {
  return Math.round(million * 1_000_000 * 100);
}

export function millionFromSatang(satang: number) {
  return satang / 100 / 1_000_000;
}

export function formatMillion(satang: number) {
  const m = millionFromSatang(satang);
  return `${m.toLocaleString("th-TH", { maximumFractionDigits: 2 })} ลบ.`;
}

export function formatFit(score: number) {
  return (score / 10).toFixed(1);
}

export function formatValueStars(n: number) {
  return `${n}/5`;
}

export function formatLandWah(tenths: number | null | undefined) {
  if (tenths == null) return "";
  return `${(tenths / 10).toLocaleString("th-TH", { maximumFractionDigits: 1 })} ตร.ว.`;
}

export function formatUsable(min: number | null | undefined, max: number | null | undefined) {
  if (min == null && max == null) return "";
  if (min != null && max != null && min !== max) return `${min}–${max} ตร.ม.`;
  return `${min ?? max} ตร.ม.`;
}

export function bahtPerWah(priceSatang: number, landWahTenths: number | null | undefined) {
  if (!landWahTenths) return null;
  const baht = priceSatang / 100;
  const wah = landWahTenths / 10;
  if (wah <= 0) return null;
  return Math.round(baht / wah);
}

export function formatBaht(baht: number) {
  return `${baht.toLocaleString("th-TH")} บาท`;
}

export function houseTypeLabel(type: string, hasDetached: boolean, hasTwin: boolean) {
  if (type === "twin" || (!hasDetached && hasTwin)) return "บ้านแฝด";
  if (hasDetached && hasTwin) return "เดี่ยว/แฝด";
  return "บ้านเดี่ยว";
}

export const BUDGET_CHIPS = [
  { id: "all", label: "ทุกงบ", satang: null as number | null },
  { id: "4", label: "4 ลบ.", satang: satangFromMillion(4) },
  { id: "4.5", label: "4.5 ลบ.", satang: satangFromMillion(4.5) },
  { id: "5", label: "5 ลบ.", satang: satangFromMillion(5) },
  { id: "6.5", label: "6.5 ลบ.", satang: satangFromMillion(6.5) },
] as const;
