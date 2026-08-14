# Wave 1 — R2 ไฟล์จริง (V0.0.3)

## Goal
แนบใบเสร็จที่โมดูลเงิน แล้วเปิดดูได้จากแอป

## Human
1. Cloudflare Dashboard → R2 → Create bucket (private)
2. Manage R2 API Tokens → สร้าง token อ่าน/เขียน
3. ใส่ `R2_ACCOUNT_ID` `R2_ACCESS_KEY_ID` `R2_SECRET_ACCESS_KEY` `R2_BUCKET_NAME` ใน `.env.local`
4. รีสตาร์ท `npm run dev`

## ทดสอบ
- [ ] `/money` อัปโหลดรูปใบเสร็จ บันทึก แล้วกดเปิดไฟล์
- [ ] `/inbox` แนบรูปแล้วจด
- [ ] `/vault` แนบไฟล์
- [ ] คัด URL จาก R2 dashboard เปิด incognito ต้องเข้าไม่ได้

## Done when
object อยู่ใน `userId/receipts/...` หรือ `captures` / `vault` ตามโมดูล
