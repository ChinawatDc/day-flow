# day-flow — Goal

## Focus
เว็บพอร์ทัลชีวิตประจำวันบนมือถือ: ล็อกอินแล้วเห็นเมนูทุกโมดูล กดเข้าใช้ได้เลย

สถานะตอนนี้: **โค้ดมุ่งเกณฑ์ V1.0.0** บ้านแอป = `/menu` ตัวพิมพ์ = Anuphan — ยังต้องมี Neon + R2 + deploy ถึงใช้จริง ดู [docs/VERSIONS.md](docs/VERSIONS.md) และ [docs/02-v1.0.0/README.md](docs/02-v1.0.0/README.md)

เป้าถัดไป: ปิด human gates + Evidence ใช้จริง แล้วค่อย tag `v1.0.0`

## Current target: เกณฑ์โค้ด V1.0.0

บ้านแอป = เมนู (`/menu`) · ตัวพิมพ์ = Anuphan · งานคลื่น: [docs/02-v1.0.0/README.md](docs/02-v1.0.0/README.md) · สไตล์: [docs/DESIGN-2026.md](docs/DESIGN-2026.md)

### โค้ด V1.0 (กำลังทำ)
- [x] สมุดใบเดียว: token + ชุด UI + เมนูเป็นบ้าน
- [x] แก้รายการ / ค้น / สรุปเงินเดือน / ส่งออก / เปลี่ยนรหัส / ลบบัญชี
- [x] วันนี้ชี้ค้าง + คัดลอกบิลเดือน
- [x] health แยกชัด + e2e login/งาน/เงิน

## Current target: V0.1.0 (human คู่ขนาน)

### Done when
- [x] Next.js App Router เป็น FE+BE, Drizzle schema, better-auth, R2 client, ธีมสมุดบ้าน
- [x] ฮับกระเบื้องไม่เท่ากัน + rail / bottom nav
- [x] หน้าโมดูล 7 อันมี CRUD ในโค้ด
- [x] `.env.local` + `BETTER_AUTH_SECRET`
- [x] เครื่องมือ schema: `db:push` / `db:apply` (V0.0.2)
- [x] health รายงาน `r2` (V0.0.3)
- [x] อุดช่อง Inbox→เงิน, ลบ R2, ตารางเดสก์ท็อป (V0.0.4)
- [ ] Neon `DATABASE_URL` (โปรเจกต์แยกจาก FitKub) + รัน `db:push`
- [ ] สมัคร/ล็อกอินบนเครื่องตัวเองได้
- [ ] CRUD ทั้ง 7 โมดูลผ่านมือถือจริง
- [ ] R2 private อัปโหลด-เปิดไฟล์ได้ (ใบเสร็จ / คลัง / รูป)
- [ ] Deploy Vercel production + env production
- [ ] ใช้เองติดต่อกัน **7 วัน**

### Evidence
| รายการ | โน้ต | วันที่ |
|---|---|---|
| `npm run build` | local | 2026-08-14 |
| Playwright 375/768/1440 | `screenshots/` | 2026-08-14 |
| Neon migrate | | |
| Production URL | | |
| ใช้จริง 7 วัน | | |

## Out of scope for V0.1.0
LINE, AI/OCR, ครอบครัว/RBAC, Google Calendar, ธนาคาร, รวม FitKub/HomeFlow

## Blocked
| Blocker | ต้องการอะไร | Owner |
|---|---|---|
| ยังไม่มี Neon | สร้างโปรเจกต์ + วาง `DATABASE_URL` ใน `.env.local` | human |
| ยังไม่มี R2 | bucket private + `R2_*` | human |
| ยังไม่ deploy | GitHub + Vercel env | human |
