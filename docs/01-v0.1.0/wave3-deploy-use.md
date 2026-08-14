# Wave 3 — Deploy + ใช้ 7 วัน (V0.1.0)

## Goal
เปิดจากมือถือบนโดเมนจริง ใช้เป็นสมุดบ้านทุกวันครบหนึ่งสัปดาห์

## Human
1. Push GitHub (อย่า commit `.env.local`)
2. Vercel Import — root `day-flow` ถ้าอยู่ใต้ PanpanGroup
3. ใส่ env: `DATABASE_URL`, `BETTER_AUTH_SECRET` (ใช้ค่าเดียวกับ local หรือสุ่มใหม่แล้วสมัครบัญชีใหม่), `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`, `R2_*`
4. Deploy production
5. `/api/health` เป็น ok
6. สมัครบนโดเมนจริง ทำตาม [../acceptance.md](../acceptance.md)
7. Add to Home Screen
8. ใช้ 7 วัน แล้วกรอกตาราง Evidence ใน `GOAL.md`

## Done when
ทุกช่อง Evidence ใน `GOAL.md` มีค่า และ checklist V0.1 Done when ติ๊กครบ
