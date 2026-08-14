# เวอร์ชันจนถึง V0.1.0

แนว: ปล่อยทีละคลื่นให้ **ใช้เองได้** ไม่ขยายสโคป

| เวอร์ชัน | ความหมาย | สถานะ |
|----------|-----------|--------|
| **V0.0.1** | โค้ดพอร์ทัล + UI + 7 โมดูล + auth/R2 ในโค้ด | ถึงแล้ว (2026-08-14) |
| **V0.0.2** | Neon จริง + migrate + ล็อกอิน/CRUD บนเครื่อง | ค้าง human: `DATABASE_URL` |
| **V0.0.3** | R2 private ใช้ไฟล์ได้จริง | ค้าง human: bucket + env |
| **V0.0.4** | อุดช่องว่างที่ทำให้ใช้ทุกวันสะดุด | ยังไม่ทำโค้ด |
| **V0.1.0** | ขึ้น Vercel + ใช้เอง 7 วัน | ค้าง human deploy + ใช้จริง |

ไม่ข้าม V0.0.2 — ไม่มี DB แล้วโมดูลไม่มีค่า

## V0.0.1 — สิ่งที่มีในรีโป
- หน้า `/login` `/` `/today` `/inbox` `/tasks` `/money` `/vault` `/home` `/journal`
- ธีมสมุดบ้าน, Cabinet Grotesk, Anuphan, PWA manifest
- Drizzle schema + `drizzle/0000_init.sql`
- better-auth อีเมล/รหัส (Google ถ้าใส่ client id)
- Playwright หน้า login + preview ที่ 375 / 768 / 1440

## V0.0.2 — ให้ dev ใช้ได้บนเครื่อง
งาน: [01-v0.1.0/wave0-env-db.md](./01-v0.1.0/wave0-env-db.md)

- Neon โปรเจกต์**ใหม่** (ห้ามใช้ DB ของ FitKub — ตาราง `user` ชน)
- วาง `DATABASE_URL` ใน `.env.local`
- `npm run db:push` หรือวาง SQL ใน Neon console
- สมัครบัญชีแล้วสร้างงาน/รายจ่ายอย่างน้อย 1 รายการ

## V0.0.3 — ไฟล์
งาน: [01-v0.1.0/wave1-r2.md](./01-v0.1.0/wave1-r2.md)

- R2 bucket private, ไม่เปิด public listing
- `R2_*` ใน `.env.local`
- อัปโหลดใบเสร็จแล้วเปิดจากโมดูลเงินได้

## V0.0.4 — ช่องว่างก่อนเรียก 0.1
งาน: [01-v0.1.0/wave2-gaps.md](./01-v0.1.0/wave2-gaps.md)

ควรทำก่อน V0.1.0:
- จดด่วน → เงิน: มีช่องจำนวน (หรือส่งต่อไปฟอร์มเงินพร้อมโน้ต)
- ลบรายการแล้วลบ object ใน R2 ด้วย
- ปิด `/preview/*` ใน production (ตอนนี้ปิดเมื่อ `NODE_ENV=production` แล้ว ยกเว้น `ALLOW_PREVIEW`)
- แก้งานจากตารางเดสก์ท็อป (ตอนนี้ลบ/สลับสถานะบางโมดูลมีแค่การ์ดมือถือ)
- ตรวจ `db:migrate` ให้ journal/snapshot ของ drizzle-kit ใช้ได้ หรือยึด `db:push` เป็นทางการใน DEPLOY

ไม่บังคับก่อน 0.1 แต่ควรรู้:
- Google login ไม่จำเป็น
- ไม่มี soft-delete, ไม่มีค้นหา, ไม่มีงบเดือนเต็ม

## V0.1.0 — ใช้จริง
งาน: [01-v0.1.0/wave3-deploy-use.md](./01-v0.1.0/wave3-deploy-use.md) · เกณฑ์ [acceptance.md](./acceptance.md)

- Push GitHub, Vercel production, env โดเมนจริง
- `BETTER_AUTH_URL` = URL production
- health `/api/health` เป็น `{ ok: true }`
- ติดตั้ง PWA บนมือถือ
- ใช้ครบ 7 โมดูลในชีวิตจริง 7 วัน แล้วติ๊ก Evidence ใน `GOAL.md`

## ห้ามทำก่อนปิด V0.1.0
- LINE OA, AI, OCR ใบเสร็จ
- สมาชิกครอบครัว / แชร์บ้าน
- ซิงก์ปฏิทินหรือธนาคาร
- รวมเข้า FitKub หรือ HomeFlow
- Billing, Sentry, multi-tenant

หลัง V0.1.0 (ยังไม่เปิดงาน): V0.1.x แก้จากของที่ใช้จริง, V0.2 ค่อยคิดค้นหา/งบเดือน/เตือนหมดอายุแบบ push
