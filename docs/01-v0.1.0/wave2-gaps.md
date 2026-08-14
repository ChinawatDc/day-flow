# Wave 2 — อุดช่องว่างโค้ด (V0.0.4)

ทำหลัง Wave 0 ใช้ DB ได้แล้ว ไม่ขยายฟีเจอร์ใหม่

## In scope
1. **จดด่วน → เงิน** — ฟอร์มจำนวน+หมวด แล้ว `insert expenses` (ใบเสร็จใช้ไฟล์จากจดด่วนถ้ามี)
2. **ลบแล้วลบ R2** — capture / expense / vault / ของในบ้าน
3. **ตารางเดสก์ท็อป** — งาน / เงิน / คลัง มีปุ่มลบ (งานมีเสร็จด้วย)
4. **schema ทางการ** — `db:push` / `db:apply` + `0000_init.sql` (ไม่ใช้ drizzle-kit migrate)
5. **preview ใน prod** — 404 เมื่อ `VERCEL_ENV=production`

## Out of scope
AI, ครอบครัว, งบขั้นสูง, LINE

## Test
- [x] จาก Inbox กรอกบาทแล้วสร้างรายจ่าย (โค้ด)
- [x] ลบรายการที่มีไฟล์ เรียก `deletePrivateObject`
- [x] เดสก์ท็อป ตารางงาน/เงิน/คลัง ลบได้
