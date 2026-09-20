export type LoanDocTemplate = {
  docKey: string;
  category: "personal" | "income" | "asset" | "property";
  target: "primary" | "co_borrower" | "shared";
  title: string;
  description: string;
  sortOrder: number;
};

export const DEFAULT_LOAN_DOCS: LoanDocTemplate[] = [
  // ==========================================
  // 👤 ผู้กู้หลัก (พนักงานบริษัท / รายได้ประจำ)
  // ==========================================
  {
    docKey: "primary_id_card",
    category: "personal",
    target: "primary",
    title: "1. สำเนาบัตรประจำตัวประชาชน (1 ชุด)",
    description: "บัตรประชาชนผู้กู้หลัก เซ็นชื่อรับรองสำเนาถูกต้องกำกับ 'ใช้สำหรับยื่นกู้สินเชื่อบ้านเท่านั้น'",
    sortOrder: 1,
  },
  {
    docKey: "primary_house_reg",
    category: "personal",
    target: "primary",
    title: "2. สำเนาทะเบียนบ้าน (1 ชุด)",
    description: "ทุกหน้าที่มีคนอยู่และหน้าแรก เซ็นรับรองสำเนาถูกต้อง",
    sortOrder: 2,
  },
  {
    docKey: "primary_name_change",
    category: "personal",
    target: "primary",
    title: "3. สำเนาใบเปลี่ยนชื่อ-นามสกุล (ถ้ามี 1 ชุด)",
    description: "กรณีเคยเปลี่ยนชื่อ หรือนามสกุลเดิม เซ็นกำกับ",
    sortOrder: 3,
  },
  {
    docKey: "primary_marriage_cert",
    category: "personal",
    target: "primary",
    title: "4. สำเนาทะเบียนสมรส / ใบหย่า / ใบมรณบัตร (1 ชุด)",
    description: "สำเนาทะเบียนสมรส (กรณีสมรสจดทะเบียน หรือถ้าไม่จดทะเบียนแต่มีบุตรให้แนบสูติบัตรบุตร)",
    sortOrder: 4,
  },
  {
    docKey: "primary_salary_cert",
    category: "income",
    target: "primary",
    title: "5. หนังสือรับรองเงินเดือน (อายุไม่เกิน 30 วัน)",
    description: "ระบุตำแหน่ง อัตราเงินเดือน อายุงาน (*กรณีใช้สวัสดิการ ธอส. ให้ระบุข้อความ 'กู้สวัสดิการแบบไม่มีเงินฝาก')",
    sortOrder: 5,
  },
  {
    docKey: "primary_salary_slips",
    category: "income",
    target: "primary",
    title: "6. สลิปเงินเดือนย้อนหลัง 6 เดือน (เพิ่มเดือนโบนัส)",
    description: "สลิปเงินเดือน 6 เดือนล่าสุด และขอเพิ่มเดือนที่โบนัสเข้าด้วย",
    sortOrder: 6,
  },
  {
    docKey: "primary_bank_statement",
    category: "income",
    target: "primary",
    title: "7. Statement บัญชีเงินเดือนย้อนหลัง 6 เดือน (เพิ่มเดือนโบนัส)",
    description: "Statement ย้อนหลัง 6 เดือนต่อเนื่อง พร้อมขอเพิ่มเดือนที่เงินโบนัสเข้า ประทับตราธนาคาร",
    sortOrder: 7,
  },
  {
    docKey: "primary_tax_pnd90_91",
    category: "income",
    target: "primary",
    title: "8. เอกสารยื่นภาษี ภ.ง.ด. 90/91 ปี 68 / ทวิ 50 (ถ้ามี)",
    description: "แบบแสดงรายการภาษีเงินได้บุคคลธรรมดา ภ.ง.ด.90/91 ปี 2568 หรือหนังสือรับรองหักภาษี ณ ที่จ่าย ทวิ 50",
    sortOrder: 8,
  },
  {
    docKey: "primary_savings_assets",
    category: "asset",
    target: "primary",
    title: "9. สำเนาสมุดเงินฝากส่วนตัว / ทรัพย์สินปลอดภาระ (ถ้ามี)",
    description: "เงินออม, สลากออมทรัพย์, ทะเบียนรถ, โฉนดที่ดินที่ปลอดภาระหนี้ แสดงความมั่นคงทางการเงิน",
    sortOrder: 9,
  },
  {
    docKey: "primary_license_prof",
    category: "income",
    target: "primary",
    title: "10. สำเนาใบอนุญาตประกอบวิชาชีพ (ถ้ามี)",
    description: "เฉพาะแพทย์, วิศวกร, ทนายความ, สถาปนิก (ได้รับเรทดอกเบี้ยพิเศษ)",
    sortOrder: 10,
  },

  // ==========================================
  // 👥 ผู้กู้ร่วม (แฟน / พนักงานบริษัท / คู่สมรส)
  // ==========================================
  {
    docKey: "co_id_card",
    category: "personal",
    target: "co_borrower",
    title: "1. สำเนาบัตรประจำตัวประชาชนแฟน / คู่สมรส (1 ชุด)",
    description: "บัตรประชาชนแฟน เซ็นชื่อรับรองสำเนาถูกต้องกำกับ 'ใช้สำหรับยื่นกู้สินเชื่อบ้านเท่านั้น'",
    sortOrder: 20,
  },
  {
    docKey: "co_house_reg",
    category: "personal",
    target: "co_borrower",
    title: "2. สำเนาทะเบียนบ้านแฟน / คู่สมรส (1 ชุด)",
    description: "สำเนาทะเบียนบ้านแฟน (ทุกหน้าที่มีคนอยู่และหน้าแรก) เซ็นรับรองสำเนาถูกต้อง",
    sortOrder: 21,
  },
  {
    docKey: "co_name_change",
    category: "personal",
    target: "co_borrower",
    title: "3. สำเนาใบเปลี่ยนชื่อ-นามสกุลแฟน (ถ้ามี 1 ชุด)",
    description: "กรณีแฟนเคยเปลี่ยนชื่อหรือนามสกุลเดิม เซ็นกำกับ",
    sortOrder: 22,
  },
  {
    docKey: "co_marriage_or_proof",
    category: "personal",
    target: "co_borrower",
    title: "4. สำเนาทะเบียนสมรส / หลักฐานความสัมพันธ์",
    description: "ทะเบียนสมรส หรือหลักฐานอยู่ร่วมกัน / จัดงานแต่งงาน / บัญชีเงินฝากร่วม",
    sortOrder: 23,
  },
  {
    docKey: "co_salary_cert",
    category: "income",
    target: "co_borrower",
    title: "5. หนังสือรับรองเงินเดือนแฟน (อายุไม่เกิน 30 วัน)",
    description: "ระบุตำแหน่ง อัตราเงินเดือน อายุงาน (*กรณีใช้สวัสดิการ ธอส. ให้ระบุข้อความ 'กู้สวัสดิการแบบไม่มีเงินฝาก')",
    sortOrder: 24,
  },
  {
    docKey: "co_salary_slips",
    category: "income",
    target: "co_borrower",
    title: "6. สลิปเงินเดือนแฟนย้อนหลัง 6 เดือน (เพิ่มเดือนโบนัส)",
    description: "สลิปเงินเดือนของแฟน 6 เดือนล่าสุด และขอเพิ่มเดือนที่โบนัสเข้า",
    sortOrder: 25,
  },
  {
    docKey: "co_bank_statement",
    category: "income",
    target: "co_borrower",
    title: "7. Statement บัญชีเงินเดือนแฟนย้อนหลัง 6 เดือน (เพิ่มเดือนโบนัส)",
    description: "Statement เงินเดือนแฟน ย้อนหลัง 6 เดือนต่อเนื่อง พร้อมเดือนที่โบนัสเข้า ประทับตราธนาคาร",
    sortOrder: 26,
  },
  {
    docKey: "co_tax_pnd90_91",
    category: "income",
    target: "co_borrower",
    title: "8. เอกสารยื่นภาษี ภ.ง.ด. 90/91 ปี 68 / ทวิ 50 แฟน (ถ้ามี)",
    description: "แบบ ภ.ง.ด.90/91 ปี 2568 หรือหนังสือ ทวิ 50 ของแฟน",
    sortOrder: 27,
  },
  {
    docKey: "co_savings_assets",
    category: "asset",
    target: "co_borrower",
    title: "9. สำเนาสมุดเงินฝากส่วนตัว / ทรัพย์สินปลอดภาระแฟน (ถ้ามี)",
    description: "เงินออม, ทะเบียนรถ, โฉนดที่ดินปลอดภาระของแฟน (ช่วยเสริมฐานะทางการเงิน)",
    sortOrder: 28,
  },
  {
    docKey: "co_license_prof",
    category: "income",
    target: "co_borrower",
    title: "10. สำเนาใบอนุญาตประกอบวิชาชีพแฟน (ถ้ามี)",
    description: "เฉพาะแพทย์, วิศวกร, ทนายความ, สถาปนิก",
    sortOrder: 29,
  },

  // ==========================================
  // 🏡 เอกสารหลักประกันโครงการ & การจอง SC Asset
  // ==========================================
  {
    docKey: "prop_scasset_booking",
    category: "property",
    target: "shared",
    title: "1. เอกสารการจอง / ใบเสร็จรับเงินจอง SC Asset",
    description: "เอกสารการจองโครงการ Venue Portrait Westgate พร้อมใบเสร็จรับเงินค่าจองและทำสัญญา",
    sortOrder: 40,
  },
  {
    docKey: "prop_contract_sale_purchase",
    category: "property",
    target: "shared",
    title: "2. สัญญาจะซื้อจะขาย Venue Portrait Westgate",
    description: "สัญญาจะซื้อจะขายที่ทำกับทาง SC Asset ในวันทำสัญญา เพื่อประกอบการยื่นสินเชื่อ",
    sortOrder: 41,
  },
  {
    docKey: "prop_title_deed",
    category: "property",
    target: "shared",
    title: "3. สำเนาโฉนดที่ดินแปลงที่จอง",
    description: "สำเนาโฉนดแปลงที่เลือก ขอรับจากเจ้าหน้าที่โครงการ SC Asset เพื่อให้ธนาคารประเมินหลักทรัพย์",
    sortOrder: 42,
  },
  {
    docKey: "prop_plan_map",
    category: "property",
    target: "shared",
    title: "4. แผนที่ตั้งโครงการและผังแบบบ้าน",
    description: "โบรชัวร์ แผนที่โครงการ Venue Portrait Westgate และแบบแปลนบ้าน",
    sortOrder: 43,
  },
];

export type DefaultBank = {
  bankCode: string;
  bankName: string;
  color: string;
};

export const DEFAULT_BANKS: DefaultBank[] = [
  {
    bankCode: "scb",
    bankName: "ไทยพาณิชย์ (SCB)",
    color: "#4e2a84",
  },
  {
    bankCode: "ghb",
    bankName: "ธนาคารอาคารสงเคราะห์ (ธอส.)",
    color: "#f37021",
  },
  {
    bankCode: "ktb",
    bankName: "กรุงไทย (KTB)",
    color: "#00a5e5",
  },
  {
    bankCode: "kbank",
    bankName: "กสิกรไทย (KBank)",
    color: "#138f2d",
  },
];
