# day-flow

สมุดบ้านประจำวัน — Next.js (FE+BE), Neon, better-auth, Cloudflare R2, Vercel

**พร้อมใช้งานไหม:** โค้ดถึงเกณฑ์ V1.0 (บ้าน = วันนี้, Anuphan) — ยังต้องใส่ Neon (และ R2 ถ้าเก็บไฟล์) แล้ว deploy  
แผนเวอร์ชัน: [docs/VERSIONS.md](docs/VERSIONS.md) · จนถึง V1.0.0: [docs/ROADMAP.md](docs/ROADMAP.md) · คลื่นลงมือ: [docs/02-v1.0.0/README.md](docs/02-v1.0.0/README.md)

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
