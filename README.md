# day-flow

สมุดบ้านประจำวัน — Next.js (FE+BE), Neon, better-auth, Cloudflare R2, Vercel

**พร้อมใช้งานไหม:** ยังไม่พร้อมใช้ทุกวัน — โค้ดโมดูลครบ แต่ยังไม่มีฐานข้อมูลจริง  
แผนปิด V0.1.0 อยู่ที่ [docs/VERSIONS.md](docs/VERSIONS.md) · งานที่ต้องทำ [docs/01-v0.1.0/README.md](docs/01-v0.1.0/README.md)

## เอกสาร
- [GOAL.md](GOAL.md) — เป้าปัจจุบัน + checklist
- [flow.md](flow.md) — ทางเข้าใช้งาน
- [docs/README.md](docs/README.md) — ดัชนีเอกสารทั้งหมด

## ใช้ท้องถิ่น (หลังมี Neon)

```bash
cd day-flow
# .env.local มีอยู่แล้ว — ใส่ DATABASE_URL
npm install
npm run db:push
npm run dev
```

เปิด `http://localhost:3000/login` สมัครด้วยเมล+รหัสผ่าน (อย่างน้อย 8 ตัว)

## Visual QA

```bash
npx playwright install chromium
npm run screenshots
```
