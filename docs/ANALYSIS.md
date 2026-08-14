# วิเคราะห์จุดอ่อน + แผนสแกน / วัด Performance

สถานะโค้ดอ้างอิง: สาขา `cursor/mobile-ux-family-map-2bd3` (หลัง UX มือถือ / แผนที่ครอบครัว / ตั้งค่าใหม่)  
เอกสารนี้เขียน**ก่อนลงมือ**งาน perf/refactor ใหญ่ — ใช้เป็นแผนงาน ไม่ใช่ changelog

---

## 1) สรุปหนึ่งย่อหน้า

day-flow โค้ดถึงเกณฑ์ใช้จริงได้ แต่มีหนี้เทคนิคชัดสามก้อน: (1) **เอกสาร/ทดสอบไม่ตรงโค้ด** (บ้านแอปคือ `/menu` แต่ docs/e2e ยังชี้ `/today`), (2) **ครอบครัวยิงเซิร์ฟเวอร์ทุก 1 วินาที** ทั้งที่ Ably มีอยู่แล้ว — จุด perf อันดับ 1, (3) **CRUD แต่ละบท copy โครงเดียวกัน** + มีไฟล์/dep ตายที่ยังอยู่ในรีโป

---

## 2) จุดอ่อนระบบ (เรียงตามผลกระทบ)

### P0 — กระทบใช้จริง / ต้นทุน / ความถูกต้อง

| จุด | ที่อยู่ | ทำไมอันตราย |
|-----|--------|-------------|
| Poll แชท + โลเคชันทุก 1s | `components/family/family-chat.tsx`, `geo-share.tsx`, `family/actions.ts` | เปิดแท็บครอบครัว = DB read ต่อเนื่อง; คนแชร์ยัง `pingLocation` ทุกวินาที → write storm |
| Docs / e2e ไม่ตรงบ้านแอป | `GOAL.md`, `flow.md`, `docs/*`, `tests/flow.spec.ts` vs `app/(app)/page.tsx` | ล็อกอินไป `/menu` แต่เทสรอ `/today` — CI/acceptance มั่ว |
| อัปโหลด R2 เงียบเมื่อพัง | `lib/upload.ts` | คืน `null` แล้วบันทึกรายการต่อ — ผู้ใช้คิดว่ามีไฟล์ |
| แทนที่ไฟล์ไม่ลบของเก่า | `vault/actions`, `money/actions`, `home/actions` | orphan objects ใน R2 |
| ไม่มี pagination | `listExpenses`, `listVault`, `listHome`, tasks `all` | เงินโหลดทั้งประวัติมาสรุปเดือนใน JS |

### P1 — UX / ดูแลยาก

| จุด | ที่อยู่ | โน้ต |
|-----|--------|------|
| ไม่มี `loading.tsx` / route `error.tsx` | ใต้ `app/(app)/` | มีแค่ `app/error.tsx` + `force-dynamic` ทั้งกลุ่ม |
| Server action error ไม่สม่ำเสมอ | vault โยน error / money-tasks มัก `return` เงียบ | ผู้ใช้ไม่รู้ว่าทำไมไม่บันทึก |
| บ้านไม่ใช้ `RecordRow` | `app/(app)/home/page.tsx` | การ์ดคนละแบบกับงาน/เงิน/คลัง |
| `/api/files` เรียก `requireUser` (redirect HTML) | `app/api/files/route.ts` | ไม่เหมาะกับ `<img>` / fetch ที่คาด JSON 401 |
| Middleware ไม่กัน auth | `middleware.ts` | กันแค่แปะ pathname — พึ่ง layout |

### P2 — หนี้โค้ด / สะอาด

| จุด | ที่อยู่ |
|-----|--------|
| คอมโพเนนต์ตาย | `hub-grid.tsx`, `edit-panel.tsx`, `ui/badge.tsx` |
| ฟอนต์ตาย ~60KB | `app/fonts/cabinet-grotesk-*.woff2` (ใช้ Anuphan จริง) |
| ฟังก์ชัน data ไม่มีคนเรียก | `listCaptures`, `monthExpenseTotal`, `monthExpensesByCategory` |
| deps ไม่ถูก import ในแอป | `zod`, `motion` (เหลือแค่ hub-grid), `@radix-ui/react-dropdown-menu`, `@radix-ui/react-tabs` |
| เอกสารโมดูลเก่า | `docs/modules.md` (ฮับที่ `/`, ช่อง inbox→เงิน ฯลฯ) |

---

## 3) ส่วนที่ควรปรับ (ทิศทาง ไม่ใช่สเปกเต็ม)

### 3.1 Realtime ครอบครัว (ก่อนอื่น)
1. เมื่อ Ably `live` → **ปิด poll** หรือถี่ลงมาก (เช่น 15–30s เป็น safety net)
2. เมื่อไม่ live → poll แบบ backoff (1s → 3s → 10s) ไม่คงที่ 1s
3. `pingLocation`: ส่งเมื่อพิกัดขยับเกิน threshold หรืออย่างต่ำทุก 3–5s (ไม่ใช่ 1s ตายตัว) — UI แมพยัง animate ได้จากค่าล่าสุด
4. แยก “ดูแมพ” กับ “แชท” ไม่ mount ทั้งคู่ถ้าแท็บไม่เปิด (`ChapterTabs` lazy)

### 3.2 ข้อมูล / Server Actions
- ใส่ขนาดไฟล์สูงสุด + ประเภทที่ยอมรับ
- แทนที่ไฟล์ → `deletePrivateObject` ของ key เก่า
- action ที่เงียบ → คืน `{ ok, error }` หรือ throw ข้อความไทย (ให้ `ClosingForm` โชว์)
- `listExpenses` จำกัดช่วงเดือน + cursor; สรุปเดือนทำที่ SQL

### 3.3 UX โครงเดียว
- ดึง `StatCard`, `SectionCard`, `ToggleAction`, `ItemCard` ใช้ร่วม
- หน้าบ้านกลับไปโทนเดียวกับ `RecordRow` / `ItemCard`
- sync docs + e2e ให้บ้าน = `/menu` (หรือตัดสินใจกลับ `/today` แต่ต้องเลือกหนึ่ง)

### 3.4 Performance ทั่วไป
- `getTodaySnapshot` เบาลงสำหรับเมนู (นับอย่างเดียว ไม่ดึงแถวเต็ม)
- ลด `revalidatePath` กว้างเกิน (inbox รีเฟรช 7 เส้น)
- พิจารณา route-level `loading.tsx`
- รูป journal ใช้ขนาดจำกัด / หรือ signed URL ที่มี cache headers

---

## 4) แผนสแกนโค้ด + วัด Performance (ทำเป็นคลื่น)

> ยัง**ไม่ลงมือ**ในคลื่นนี้จนกว่าจะติ๊กขั้นเตรียมด้านล่าง

### คลื่น A — Baseline (ครึ่งวัน dev)
เครื่องมือ:
- `npm run build` + ดู `.next/analyze` หรือ `@next/bundle-analyzer`
- Chrome DevTools Performance + Network บนมือถือ (หรือ throttling)
- Playwright trace หน้า `/menu`, `/money`, `/family` (แท็บโลเคชันเปิดแชร์)

วัดอะไร:
| เมตริก | เป้าคร่าวๆ |
|--------|------------|
| JS bundle หน้า family (client) | ลดหลัง lazy map |
| Requests/นาที ตอนเปิดแท็บโลเคชัน | จาก ~120/min ต่อคน → &lt; 20/min เมื่อมี Ably |
| TTFB หน้า `/menu` | เทียบก่อน-หลัง snapshot เบา |
| LCP หน้า journal ที่มีรูป | ไม่ดึงรูปเต็มทุกใบพร้อมกัน |

ส่งมอบ: ตารางตัวเลขก่อนแก้ แปะใน PR / `GOAL.md` Evidence

### คลื่น B — แก้ตามตัวเลข
1. Realtime backoff (ข้อ 3.1)
2. Snapshot เบา + pagination เงิน
3. Bundle: dynamic `FamilyMap`, ตัด dep ตาย

### คลื่น C — สแกนคุณภาพต่อเนื่อง
- `npx knip` หรือ `ts-prune` หา export ตาย
- `eslint` กฎ `no-unused` / import
- optional: Lighthouse CI บน preview URL

เกณฑ์หยุดคลื่น: ตัวเลขคลื่น A ดีขึ้นชัด + ไม่มี regression e2e login/งาน/เงิน

---

## 5) งานทำความสะอาดที่ทำได้ทันที (คลื่น 0)

สถานะ: **ทำแล้วใน PR นี้** (ดูรายการด้านล่าง) — ยัง**ไม่**แตะ poll ครอบครัว / docs sync ทั้งชุด

1. **ลบโค้ด/ไฟล์ตาย** ✅
   - `components/hub-grid.tsx`
   - `components/notebook/edit-panel.tsx`
   - `components/ui/badge.tsx`
   - `app/fonts/cabinet-grotesk-*.woff2`
   - export ว่างใน `lib/data.ts` (`listCaptures`, `monthExpenseTotal`, `monthExpensesByCategory`)
   - ถอด deps: `zod`, `motion`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-tabs`

2. **ดึงคอมโพเนนต์ซ้ำ** ✅
   - `StatCard` — `components/notebook/stat-card.tsx`
   - `SectionCard` — `components/notebook/section-card.tsx`
   - `ToggleAction` — `components/notebook/toggle-action.tsx`
   - `ItemCard` — `components/notebook/item-card.tsx`
   - `CategorySelect` — `components/notebook/category-select.tsx`

3. **ไม่ทำในคลื่น 0** (รอคลื่น A/B)
   - เปลี่ยนช่วง poll ครอบครัว
   - รื้อ docs ทั้งชุดให้ตรง `/menu`
   - ลบ `app/preview/*` (ยังใช้ screenshots)

---

## 6) Checklist ก่อนเริ่มคลื่น A/B

- [ ] ตัดสินใจบ้านแอปถาวร: `/menu` หรือ `/today`
- [ ] มี Neon + บัญชีทดสอบอย่างน้อย 2 คนในครอบครัว (สำหรับวัด poll)
- [ ] เปิด bundle analyzer ใน `next.config`
- [ ] บันทึกตัวเลข baseline ลง Evidence

---

## 7) อ้างอิงไฟล์สำคัญ

```
app/(app)/layout.tsx          force-dynamic ทั้งแอป
app/(app)/page.tsx            redirect → /menu
lib/data.ts                   query รวม
lib/upload.ts                 R2 upload เงียบเมื่อพัง
components/family/geo-share.tsx   ping + poll 1s
components/family/family-chat.tsx poll 1s
components/notebook/*         ชุดสมุดที่ใช้ซ้ำอยู่แล้ว
```
