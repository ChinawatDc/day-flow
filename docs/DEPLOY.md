# Deploy

ทำตามลำดับ อย่า skip Neon

## 1) Neon
- [ ] สร้างโปรเจกต์ **day-flow** คนละตัวกับ FitKub
- [ ] คัดลอก pooled `DATABASE_URL` (`sslmode=require`)
- [ ] วางใน `.env.local`
- [ ] จากโฟลเดอร์ `day-flow`: `npm run db:push` (ทางการ) หรือ `npm run db:apply`
- [ ] ถ้าทั้งคู่ไม่ผ่าน: วางเนื้อหา [drizzle/0000_init.sql](../drizzle/0000_init.sql) ใน Neon SQL Editor แล้วรัน

อย่าใช้ `drizzle-kit migrate` กับ snapshot ว่าง — schema ต้นทางคือ `0000_init.sql` + `db:push`

ตรวจตาราง: `user`, `session`, `account`, `verification`, `captures`, `tasks`, `expenses`, `vault_items`, `home_items`, `shopping_items`, `home_bills`, `journal_entries`, `journal_photos`

## 2) Auth env (มีใน `.env.local` แล้ว)
- [x] `BETTER_AUTH_SECRET` (สุ่ม 32 bytes)
- [ ] `BETTER_AUTH_URL` = `http://localhost:3000` ตอน dev
- [ ] production เปลี่ยนเป็น `https://<โดเมน>` ทั้ง `BETTER_AUTH_URL` และ `NEXT_PUBLIC_APP_URL`

Google ไม่บังคับ

## 3) Cloudflare R2 (V0.0.3)
- [ ] Bucket ชื่อเช่น `day-flow` **private**
- [ ] API token มีสิทธิ์ Object Read+Write
- [ ] `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`

อย่าเปิด public access

## 4) รันบนเครื่อง
```bash
npm run dev
```
- [ ] `/login` สมัครได้
- [ ] `/api/health` ได้ `{ "ok": true }`
- [ ] สร้างงานและรายจ่ายได้โดยไม่ต้องมี R2

## 5) GitHub + Vercel (V0.1.0)
- [ ] Push โค้ด (root directory บน Vercel = `day-flow` ถ้าโมโนรีโป)
- [ ] Env บน Vercel ครบชุดเดียวกับ `.env.example` + ค่าจริง
- [ ] Redeploy หลังใส่ env
- [ ] เปิด `https://<โดเมน>/api/health`
- [ ] สมัครบัญชีใหม่บนโดเมนจริง (อย่าลืม trusted origin ของ better-auth = `BETTER_AUTH_URL`)

`vercel.json` ตั้ง framework nextjs แล้ว ไม่มี cron ใน V0.1.0
