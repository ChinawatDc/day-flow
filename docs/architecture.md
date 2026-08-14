# สถาปัตย์

```
มือถือ/เดสก์ท็อป → Vercel (Next.js App Router)
                     ├ Server Actions (CRUD)
                     ├ /api/auth/*  better-auth
                     ├ /api/files   signed URL
                     └ /api/health
              Neon Postgres          Cloudflare R2 (private)
```

## สแต็ก
| ชั้น | ของที่ใช้ |
|------|-----------|
| UI | Tailwind 4, shadcn-style (คัดลอกใน `components/ui`), Radix Sheet/Dialog, cva, lucide, motion |
| ฟอนต์ | Anuphan (`next/font/google`) ทั้ง title / body / numeric — token ใน `app/globals.css` (`.text-display` `.text-title` `.text-body` `.text-caption` `.text-numeric`) |
| Auth | better-auth + Drizzle adapter, cookie session, `nextCookies` |
| DB | Drizzle + `@neondatabase/serverless` Pool `max: 1` |
| ไฟล์ | S3 API ของ R2, key `userId/{module}/...` |
| Host | Vercel |

## โฟลเดอร์สำคัญ
- `app/(app)/` — หน้าหลังล็อกอิน (`layout` เรียก `requireUser`, `dynamic = force-dynamic`) บ้านคือ `/today` ฮับคือ `/menu`
- `components/notebook/` — RecordRow, NotebookForm, ConfirmDelete, AmountText
- `app/(app)/*/actions.ts` — mutation
- `lib/db/schema.ts` — auth tables + โมดูล
- `lib/data.ts` — query
- `app/preview/` — สำหรับ screenshot ไม่ใช้ใน prod

## ความปลอดภัยขั้นต่ำ V0.1
- ทุกหน้าแอปต้องมี session
- ไฟล์ดูได้เฉพาะ key ที่ขึ้นต้นด้วย `user.id`
- R2 ไม่ public
- ไม่ใช้ Neon เดียวกับ FitKub
