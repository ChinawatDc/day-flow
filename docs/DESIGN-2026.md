# Design System 2026

day-flow — สมุดบ้านอุ่น (kaffir) ตาม [DESIGN.md](./DESIGN.md) + impeccable craft floor

## หลัก
- พื้น: `--canvas` (OKLCH) + grain บางๆ (`.df-canvas`)
- การ์ด: `.df-card` / `.df-card-hero` — ใช้เมื่อเป็นรายการหรือจุดโฟกัส ไม่ซ้อนการ์ด
- แบรนด์: `--brand` / `--accent` (ใช้น้อย)
- ฟอนต์: **Prompt** (หัว/ตัวเลข) + **Bai Jamjuree** (เนื้อ) — fixed `rem` ในแอป
- ไม่มี blurb/hint/อิโมจิ — Lucide เท่านั้น
- Motion: `--ease-out` expo, `.df-enter` / `.df-stagger`, เคารพ `prefers-reduced-motion`

## Utilities
| Class | ใช้เมื่อ |
|-------|---------|
| `.df-canvas` | พื้น shell |
| `.df-card` | รายการ / บล็อก |
| `.df-card-hero` | โฟกัสเขียว |
| `.df-chip` / `.df-chip-active` | filter |
| `.df-nav-float` | bottom nav |
| `.df-field` | input |
| `.df-press` | กดได้ |
| `.df-stagger` | รายการเข้าทีละอัน |

## ห้าม
side-stripe · gradient text · eyebrow เหนือหัวข้อ · glass เพื่องานตกแต่ง · bounce easing

อย่า soft-code สี — ใช้ token / `.df-*`
