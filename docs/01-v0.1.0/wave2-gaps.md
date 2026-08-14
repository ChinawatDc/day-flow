# Wave 2 — อุดช่องว่างโค้ด (V0.0.4)

ทำหลัง Wave 0 ใช้ DB ได้แล้ว ไม่ขยายฟีเจอร์ใหม่

## In scope
1. **จดด่วน → เงิน**  
   ตอนนี้ปุ่มเงินแค่เปลี่ยน `captures.kind`  
   ให้มีจำนวนบาท (และหมวดถ้ามี) แล้ว `insert expenses` หรือพาไป `/money` พร้อมโน้ต
2. **ลบแล้วลบ R2**  
   `deleteExpense` / `deleteVaultItem` / `deleteHomeItem` / `deleteCapture` เรียก `deletePrivateObject` ถ้ามี key
3. **ตารางเดสก์ท็อป**  
   งาน / เงิน / คลัง มีปุ่มลบหรือเสร็จครบเหมือนการ์ดมือถือ
4. **ยืนยัน migrate**  
   ให้ `npm run db:migrate` ใช้ได้ หรือเขียนใน DEPLOY ว่ายึด `db:push` + `0000_init.sql` เป็นทางการ
5. **อย่าเปิด preview ใน prod**  
   ตรวจว่า `/preview/hub` บน Vercel ได้ 404

## Out of scope
AI, ครอบครัว, งบขั้นสูง, LINE

## Test
- [ ] จาก Inbox สร้างรายจ่ายแล้วเห็นในเงินและหน้าวันนี้
- [ ] ลบรายการที่มีไฟล์ แล้ว object ใน bucket หาย
- [ ] เดสก์ท็อป 1440 ลบงานได้จากตาราง
