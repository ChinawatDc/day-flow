const THAI_MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
] as const;

export function toBuddhistYear(gregorianYear: number) {
  return gregorianYear + 543;
}

export function isoToThaiDisplay(iso: string | null | undefined) {
  if (!iso) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return "";
  const [, y, mo, d] = m;
  return `${Number(d)} ${THAI_MONTHS[Number(mo) - 1]} ${toBuddhistYear(Number(y))}`;
}

export function isoToThaiShort(iso: string | null | undefined) {
  if (!iso) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return "";
  const [, y, mo, d] = m;
  return `${d}/${mo}/${toBuddhistYear(Number(y))}`;
}

export function isoMonthThai(ym: string) {
  const m = /^(\d{4})-(\d{2})/.exec(ym);
  if (!m) return "";
  return `${THAI_MONTHS[Number(m[2]) - 1]} ${toBuddhistYear(Number(m[1]))}`;
}
