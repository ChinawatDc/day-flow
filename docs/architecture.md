# สถาปัตย์

```
มือถือ/เดสก์ท็อป → Vercel (Next.js App Router)
                     ├ Server Actions (CRUD)
                     ├ /api/auth/*  better-auth
                     ├ /api/files   signed URL
                     ├ /api/health
                     └ /api/realtime/token  Ably
              Neon Postgres          Cloudflare R2 (private)
              Ably (แชท/โลเคชันครอบครัว — ไม่ใช้ Neon WebSocket)
```

## สแต็ก
| ชั้น | ของที่ใช้ |
|------|-----------|
| UI | Tailwind 4, shadcn-style (คัดลอกใน `components/ui`), Radix Sheet/Dialog, cva, lucide, motion |
| ฟอนต์ | Anuphan (`next/font/google`) ทั้ง title / body / numeric — token ใน `app/globals.css` (`.text-display` `.text-title` `.text-body` `.text-caption` `.text-numeric`) |
| Auth | better-auth + Drizzle adapter, cookie session, `nextCookies` |
| DB | Drizzle + `drizzle-orm/neon-http` (`neon()` HTTP ไม่ใช้ WebSocket Pool) |
| ไฟล์ | S3 API ของ R2, key `userId/{module}/...` |
| Realtime | Ably REST publish + Realtime subscribe (token จาก session) |
| Host | Vercel |

## โฟลเดอร์สำคัญ
- `app/(app)/` — หน้าหลังล็อกอิน (`layout` เรียก `requireUser`, `dynamic = force-dynamic`) บ้านคือ `/menu` สรุปวันคือ `/today`
- สไตล์: [DESIGN-2026.md](./DESIGN-2026.md)
- `app/(app)/family/` — ครอบครัว (แชท/โลเคชัน) แยกจากสมุดคนเดียว
- `components/notebook/` — RecordRow, ComposerSheet, NotebookForm, ConfirmDelete, AmountText
- `app/(app)/*/actions.ts` — mutation
- `lib/db/schema.ts` — auth tables + โมดูล
- `lib/data.ts` — query
- `app/preview/` — สำหรับ screenshot ไม่ใช้ใน prod

## ความปลอดภัยขั้นต่ำ V0.1
- ทุกหน้าแอปต้องมี session
- ไฟล์ดูได้เฉพาะ key ที่ขึ้นต้นด้วย `user.id`
- R2 ไม่ public
- ไม่ใช้ Neon เดียวกับ FitKub
- ครอบครัวแยกจากสมุดคนเดียว (ไม่แชร์งาน/เงิน/คลัง)
- Ably token จำกัด capability เฉพาะห้องบ้านของสมาชิก — ไม่ใส่ API key ในเบราว์เซอร์
