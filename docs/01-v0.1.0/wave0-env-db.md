# Wave 0 — Neon + ล็อกอินบนเครื่อง (V0.0.2)

## Goal
เปิด `npm run dev` แล้วสมัครบัญชี บันทึกงานและรายจ่ายได้โดยไม่พัง

## Human
1. สร้าง Neon project ชื่อประมาณ `day-flow`
2. Copy pooled connection string
3. วางใน `.env.local` ที่ `DATABASE_URL=`
4. ใน `day-flow`: `npm run db:push`
5. `npm run dev` → `/login` สมัคร → `/` เห็นฮับ
6. เปิด `/api/health` ต้อง `ok: true`

## ถ้า db:push ล้ม
รัน [../../drizzle/0000_init.sql](../../drizzle/0000_init.sql) ใน Neon SQL Editor

## Done when
- [ ] มีแถวในตาราง `user` หลังสมัคร
- [ ] สร้างงานใน `/tasks` แล้วเห็นใน `/today`
- [ ] สร้างรายจ่ายใน `/money` แล้วตัวเลขวันนี้เปลี่ยน
