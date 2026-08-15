# DESIGN.md

## World
สมุดกระดาษอุ่น + หมึกเขียวมะกรูด (kaffir) — organic/natural notebook with **liquid glass** surfaces (adapted from Aurora Weather CSS recipes, light mode)

## Brand words
warm · tactile · household-calm

## Theme
Light only. Canvas โทนเขียวอ่อนที่ทินต์จากแบรนด์ ไม่ขาวบริสุทธิ์ ไม่ครีมเทอร์ราคอตตา

## Color (OKLCH)
- Brand / kaffir: deep leaf green
- Accent: dried-citrus orange (ใช้น้อย)
- Neutrals tinted toward brand hue
- Glass: `--glass` / `--glass-strong` / `--glass-line` over canvas

## Type
- Display / title / numeric: **Prompt**
- Body / caption: **Bai Jamjuree**
- App UI uses fixed `rem` role scale
- No blurbs; hierarchy from size/weight/space

## Shape & depth
- Liquid glass: translucent gradient + `backdrop-filter` blur/saturate + glass-line border
- Hero cards: brand glass + one specular sheen (`df-sheen`)
- Soft offset shadows; no side-stripe; no gradient text; no emoji
- Cards only when they hold interaction or a list item

## Motion
- `--ease-out` / `--ease-soft` / `--ease-pen`
- `.df-enter` + stagger; hero sheen once; respect reduced motion

## Anti-references
Purple SaaS · Inter/Roboto · cream+terracotta · broadsheet · dark neon storm UI as product theme · glass on every tiny control
