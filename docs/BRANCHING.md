# Git branching (day-flow)

## สาขายาว
| Branch | ใช้ทำอะไร |
|--------|-----------|
| `main` | ตรงกับรีลีสล่าสุดที่ push แล้ว |
| `release/x.y.z` | ตัดตามเวอร์ชันใน [VERSIONS.md](./VERSIONS.md) |

## Tag
Annotated tag `vX.Y.Z` บน commit ของรีลีสนั้น แล้ว `git push origin vX.Y.Z`

## ลำดับที่ทำแล้ว / กำลังทำ
`release/0.0.1` → `v0.0.1` → `release/0.0.2` → … → `v0.1.0`

ห้าม force-push `main` หรือ tag ที่ push แล้ว
