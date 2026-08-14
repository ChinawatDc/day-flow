# Wave 3 — Deploy + ใช้ 7 วัน (V0.1.0)

## Goal
เปิดจากมือถือบนโดเมนจริง ใช้เป็นสมุดบ้านทุกวันครบหนึ่งสัปดาห์

## Human
1. Push GitHub — **ทำแล้ว** ที่ `ChinawatDc/day-flow` tag `v0.1.0`
2. Vercel Import — root `day-flow` ถ้าอยู่ใต้ PanpanGroup **หรือ** เชื่อม repo `day-flow` โดยตรง
3. ใส่ env: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`, `R2_*`
4. Deploy production (แนะนำ Production branch = `main` หรือ `release/0.1.0`)
5. `/api/health` เป็น `{ ok: true, db: true }`
6. สมัครบนโดเมนจริง ทำตาม [../acceptance.md](../acceptance.md)
7. Add to Home Screen
8. ใช้ 7 วัน แล้วกรอกตาราง Evidence ใน `GOAL.md`

## โค้ดคลื่นนี้
- `package.json` version `0.1.0`
- `/preview/*` 404 บน Vercel production
- ไม่มี cron

## Done when
ทุกช่อง Evidence ใน `GOAL.md` มีค่า และ checklist V0.1 Done when ติ๊กครบ
