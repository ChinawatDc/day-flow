# LINE สำหรับเลือกบ้าน

คนละช่อง: **LINE Login** กับ **Messaging API (OA)**

Callback Login ต้องเป็น `https://<โดเมน>/api/line/callback`

Webhook OA: `https://<โดเมน>/api/line/webhook`

## Login
1. สร้าง LINE Login channel
2. ใส่ `LINE_LOGIN_CHANNEL_ID` + `LINE_LOGIN_CHANNEL_SECRET`
3. หน้า `/login` มีปุ่มเข้าด้วย LINE
4. ใน `/settings` กดเชื่อม LINE ถ้าสมัครด้วยเมลแล้ว

## OA
1. สร้าง Messaging API channel
2. ใส่ `LINE_OA_CHANNEL_SECRET` + `LINE_OA_CHANNEL_ACCESS_TOKEN`
3. เปิด webhook ตาม URL ด้านบน
4. ข้อความ/ปุ่ม: เลือกบ้าน, shortlist, นัดดู, เทียบ

## Rich menu
สร้างใน LINE Official Account Manager สามปุ่ม postback:

| ป้าย | data |
|------|------|
| เลือกบ้าน | `hunt:open` |
| shortlist | `hunt:shortlist` |
| นัดดู | `hunt:visits` |

นิยามอยู่ใน `lib/line/richmenu.ts`

เมื่อคู่กดเก็บ shortlist หรือเพิ่มนัดดู ระบบส่ง Flex ไปยังสมาชิกบ้านที่ผูก LINE แล้ว
