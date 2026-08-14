# day-flow

สมุดบ้านประจำวัน — Next.js (FE+BE), Neon, better-auth, Cloudflare R2, Vercel

**พร้อมใช้งานไหม:** โค้ดถึง `v0.1.0` แล้ว — ยังต้องใส่ Neon (และ R2 ถ้าเก็บไฟล์) แล้ว deploy  
แผนเวอร์ชัน: [docs/VERSIONS.md](docs/VERSIONS.md) · สาขา/tag: [docs/BRANCHING.md](docs/BRANCHING.md)

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
