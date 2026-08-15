# Design System 2026

day-flow ใช้ชุด token เดียวทั้งแอป — สมุดบ้านทันสมัย ไม่ใช่แดชบอร์ดม่วง

## หลัก
- พื้น: `--canvas` + atmosphere (`.df-canvas`)
- การ์ด: `--surface-solid` + `.df-card` / `.df-card-hero`
- แบรนด์: `--brand` (kaffir) / `--accent` (orange)
- ฟอนต์: Prompt (หัว/ตัวเลข) + IBM Plex Sans Thai (เนื้อ) — display/title ใช้ `clamp()`
- ไม่ใช้คำอธิบาย/blurb/hint บน UI — ชื่อโมดูล + ไอคอน Lucide
- Motion: `--ease-out`, `.df-press`, `.df-enter` + เคารพ `prefers-reduced-motion`

## Utilities
| Class | ใช้เมื่อ |
|-------|---------|
| `.df-canvas` | พื้น shell |
| `.df-card` | การ์ดรายการ / บล็อก |
| `.df-card-hero` | overview เขียว |
| `.df-chip` / `.df-chip-active` | filter segmented |
| `.df-nav-float` | bottom nav |
| `.df-field` | input/select/textarea |
| `.df-press` | ปุ่ม/ลิงก์ที่กดได้ |

## Legacy aliases
`--paper`, `--kaffir`, `--orange`, `--line` ยังชี้ไปที่ token ใหม่ เพื่อไม่พังคลาสเดิมระหว่างย้าย

อย่า soft-code สีในหน้า — ใช้ token หรือ `.df-*`
