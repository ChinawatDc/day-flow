# Design System 2026

day-flow — สมุดบ้านอุ่น (kaffir) + liquid glass ตาม [DESIGN.md](./DESIGN.md)

## หลัก
- พื้น: `--canvas` + atmosphere (`.df-canvas`)
- ผิว: liquid glass — gradient โปร่ง + `backdrop-filter` + `--glass-line`
- การ์ด: `.df-card` / `.df-card-hero` (sheen ครั้งเดียวบน hero)
- แบรนด์: `--brand` / `--accent`
- ฟอนต์: **Prompt** + **Bai Jamjuree**
- ไม่มี blurb/hint/อิโมจิ — Lucide เท่านั้น
- Motion: `--ease-out` / `--ease-soft` / `--ease-pen`

## Glass tokens
| Token | บทบาท |
|-------|--------|
| `--glass` / `--glass-strong` | พื้นโปร่ง |
| `--glass-line` | ขอบ frosted |
| `--blur-glass` / `--blur-glass-strong` / `--blur-nav` / `--blur-sheet` | ความเบลอ |

## Utilities
| Class / component | ใช้เมื่อ |
|-------|---------|
| `.df-canvas` | พื้น shell |
| `.df-card` | รายการ / บล็อก (frosted paper) |
| `.df-card-hero` | โฟกัสเขียว + sheen |
| `.df-glass` | แผงโปร่งเสริม (rail / empty) |
| `StatStrip` | สรุปตัวเลขแถบเดียว |
| `RecordList` + `RecordRow flush` | รายการในแผ่นเดียว |
| `.df-chip` / `.df-chip-active` | filter |
| `.df-nav-float` | bottom nav glass |
| `.df-field` | input |
| `.df-press` / `.df-stagger` | กด / เข้าทีละอัน |

## ห้าม
side-stripe · gradient text · eyebrow · glass ทุกปุ่มจิ๋ว · bounce · ม่วง SaaS · Inter เป็นฟอนต์แอป

อย่า soft-code สี — ใช้ token / `.df-*`
