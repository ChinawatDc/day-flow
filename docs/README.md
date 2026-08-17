# day-flow Docs

แผนงานจากโค้ดปัจจุบันจนปิด **V0.1.0** แล้วต่อไปถึง **V1.0.0**

## อ่านก่อน
| ไฟล์ | หน้าที่ |
|------|---------|
| [../GOAL.md](../GOAL.md) | เป้า + checklist ปัจจุบัน (ตอนนี้ยังเป็น V0.1.0) |
| [ROADMAP.md](./ROADMAP.md) | แผนคลื่นจน tag `v1.0.0` |
| [../flow.md](../flow.md) | ทางเข้าใช้งาน |
| [BRANCHING.md](./BRANCHING.md) | สาขา `release/x.y.z` + tag `vX.Y.Z` |
| [architecture.md](./architecture.md) | สแต็ก โฟลเดอร์ ข้อมูล |
| [ANALYSIS.md](./ANALYSIS.md) | จุดอ่อนระบบ + แผนสแกน/วัด perf + คลื่นทำความสะอาด |
| [DESIGN-2026.md](./DESIGN-2026.md) | Design system CSS 2026 — token + utilities |
| [DESIGN-HUNT.md](./DESIGN-HUNT.md) | โทนโมดูลเลือกบ้าน (คนละระบบจากสมุด) |
| [LINE-HUNT.md](./LINE-HUNT.md) | LINE Login + OA สำหรับเลือกบ้าน |
| [modules.md](./modules.md) | โมดูล 7 อัน สิ่งที่ทำได้/ยังขาด |
| [DEPLOY.md](./DEPLOY.md) | Neon / R2 / Vercel |
| [acceptance.md](./acceptance.md) | เกณฑ์ผ่าน V0.1.0 |

## งานปิด V0.1.0
1. [01-v0.1.0](./01-v0.1.0/) — wave 0 ถึง 3
2. [00-ops/human-gates.md](./00-ops/human-gates.md) — สิ่งที่คนต้องทำเอง (บัญชี cloud)

## งานโค้ดถึง V1.0.0
- [02-v1.0.0](./02-v1.0.0/) — บ้านวันนี้ + Anuphan + UX ทั้งระบบ + ฟีเจอร์ 0.3–0.5

## กฎ
- อย่าเริ่มฟีเจอร์หลัง V0.1.0 ก่อน `GOAL.md` ติ๊กใช้จริง 7 วัน
- แผนหลัง 0.1 อ่าน [ROADMAP.md](./ROADMAP.md) ก่อนลงมือ (V0.2 = UX ทั้งระบบ + ตัวพิมพ์น่ารัก ไม่ใช่กองฟีเจอร์)
- แผนฟีเจอร์ใหม่คัดลอก [templates/plan-feature.md](./templates/plan-feature.md)
