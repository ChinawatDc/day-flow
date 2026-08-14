# Human gates — สิ่งที่เอเจนต์ทำแทนไม่ได้

บัญชี cloud ต้องสร้างเอง

| Gate | ทำอะไร | ใส่ที่ไหน |
|------|--------|-----------|
| Neon | โปรเจกต์ใหม่ + copy connection string | `.env.local` และ Vercel `DATABASE_URL` |
| R2 | bucket private + token | `R2_*` |
| GitHub | repo / push (ถ้าต้องการ remote) | — |
| Vercel | import โปรเจกต์ + env + deploy | `BETTER_AUTH_URL` = โดเมนจริง |
| ใช้ 7 วัน | เปิดแอปทุกวัน | Evidence ใน `GOAL.md` |

อย่าใส่ `DATABASE_URL` ของ FitKub
