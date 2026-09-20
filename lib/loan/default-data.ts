export type LoanDocTemplate = {
  docKey: string;
  category: "personal" | "income" | "debt" | "property";
  target: "primary" | "co_borrower" | "shared";
  title: string;
  description: string;
  sortOrder: number;
};

export const DEFAULT_LOAN_DOCS: LoanDocTemplate[] = [
  // --- ฝั่งผู้กู้หลัก (Primary Borrower) ---
  {
    docKey: "primary_id_card",
    category: "personal",
    target: "primary",
    title: "สำเนาบัตรประชาชน (ผู้กู้หลัก)",
    description: "สำเนาบัตรประชาชน พร้อมเซ็นสำเนาถูกต้อง รับรองยื่นกู้สินเชื่อบ้าน",
    sortOrder: 1,
  },
  {
    docKey: "primary_house_reg",
    category: "personal",
    target: "primary",
    title: "สำเนาทะเบียนบ้าน (ผู้กู้หลัก)",
    description: "ทุกหน้าที่มีข้อมูลชื่อตนเองและหน้าแรก",
    sortOrder: 2,
  },
  {
    docKey: "primary_name_change",
    category: "personal",
    target: "primary",
    title: "ใบเปลี่ยนชื่อ-สกุล (ถ้ามี)",
    description: "กรณีเคยเปลี่ยนชื่อหรือนามสกุลเดิม",
    sortOrder: 3,
  },
  {
    docKey: "primary_salary_cert",
    category: "income",
    target: "primary",
    title: "หนังสือรับรองเงินเดือน (ผู้กู้หลัก)",
    description: "ระบุตำแหน่ง เงินเดือน อายุงาน (อายุเอกสารไม่เกิน 30 วัน)",
    sortOrder: 4,
  },
  {
    docKey: "primary_salary_slips",
    category: "income",
    target: "primary",
    title: "สลิปเงินเดือนย้อนหลัง 3-6 เดือน",
    description: "สลิปคาร์บอน หรือ e-Slip ทางการ",
    sortOrder: 5,
  },
  {
    docKey: "primary_bank_statement",
    category: "income",
    target: "primary",
    title: "Statement บัญชีเงินเดือนย้อนหลัง 6 เดือน",
    description: "ขอ e-Statement ประทับตราธนาคาร หรือขอผ่านโมบายแบงก์กิ้ง",
    sortOrder: 6,
  },
  {
    docKey: "primary_tax_50tawi",
    category: "income",
    target: "primary",
    title: "หนังสือรับรองหักภาษี ณ ที่จ่าย (ทวิ 50)",
    description: "หนังสือ 50 ทวิ ของปีล่าสุด (ช่วยยืนยันโบนัสและรายได้รวม)",
    sortOrder: 7,
  },
  {
    docKey: "primary_debt_statements",
    category: "debt",
    target: "primary",
    title: "ใบเสร็จผ่อนชำระหนี้เดิม/บัตรเครดิต",
    description: "ใบเสร็จผ่อนรถ ผ่อนบ้านเดิม หรือสินเชื่อบุคคล เพื่อให้แบงก์คำนวณภาระหนี้สุทธิ",
    sortOrder: 8,
  },

  // --- ฝั่งผู้กู้ร่วม/แฟน (Co-Borrower) ---
  {
    docKey: "co_id_card",
    category: "personal",
    target: "co_borrower",
    title: "สำเนาบัตรประชาชน (ผู้กู้ร่วม/แฟน)",
    description: "สำเนาบัตรประชาชน พร้อมเซ็นสำเนาถูกต้อง",
    sortOrder: 20,
  },
  {
    docKey: "co_house_reg",
    category: "personal",
    target: "co_borrower",
    title: "สำเนาทะเบียนบ้าน (ผู้กู้ร่วม/แฟน)",
    description: "ทุกหน้าที่มีข้อมูลชื่อแฟนและหน้าแรก",
    sortOrder: 21,
  },
  {
    docKey: "co_name_change",
    category: "personal",
    target: "co_borrower",
    title: "ใบเปลี่ยนชื่อ-สกุล แฟน (ถ้ามี)",
    description: "กรณีแฟนเคยเปลี่ยนชื่อหรือนามสกุล",
    sortOrder: 22,
  },
  {
    docKey: "co_marriage_or_proof",
    category: "personal",
    target: "co_borrower",
    title: "ทะเบียนสมรส / หลักฐานความสัมพันธ์",
    description: "ทะเบียนสมรส หรือ รูปถ่ายแต่งงาน/บัญชีเงินฝากร่วม/หลักฐานอยู่ร่วมกัน",
    sortOrder: 23,
  },
  {
    docKey: "co_salary_cert",
    category: "income",
    target: "co_borrower",
    title: "หนังสือรับรองเงินเดือน (ผู้กู้ร่วม/แฟน)",
    description: "ระบุตำแหน่ง เงินเดือน อายุงาน (อายุเอกสารไม่เกิน 30 วัน)",
    sortOrder: 24,
  },
  {
    docKey: "co_salary_slips",
    category: "income",
    target: "co_borrower",
    title: "สลิปเงินเดือนแฟนย้อนหลัง 3-6 เดือน",
    description: "สลิปคาร์บอน หรือ e-Slip ทางการ",
    sortOrder: 25,
  },
  {
    docKey: "co_bank_statement",
    category: "income",
    target: "co_borrower",
    title: "Statement บัญชีเงินเดือนแฟนย้อนหลัง 6 เดือน",
    description: "Statement ย้อนหลัง 6 เดือน บัญชีที่รับเงินเดือน",
    sortOrder: 26,
  },
  {
    docKey: "co_tax_50tawi",
    category: "income",
    target: "co_borrower",
    title: "หนังสือรับรองหักภาษี ณ ที่จ่าย (ทวิ 50 แฟน)",
    description: "หนังสือ 50 ทวิ ปีล่าสุดของแฟน",
    sortOrder: 27,
  },
  {
    docKey: "co_debt_statements",
    category: "debt",
    target: "co_borrower",
    title: "ใบเสร็จผ่อนชำระหนี้สินแฟน (ถ้ามี)",
    description: "เอกสารภาระหนี้เดิม สินเชื่อ ผ่อนรถ",
    sortOrder: 28,
  },

  // --- เอกสารหลักประกันโครงการ Venue Portrait Westgate (Shared) ---
  {
    docKey: "prop_booking_contract",
    category: "property",
    target: "shared",
    title: "ใบจอง / สัญญาจะซื้อจะขาย Venue Portrait Westgate",
    description: "เอกสารสัญญาจะซื้อจะขายที่ทำกับทาง SC Asset พร้อมใบเสร็จเงินจอง/ทำสัญญา",
    sortOrder: 40,
  },
  {
    docKey: "prop_title_deed_copy",
    category: "property",
    target: "shared",
    title: "สำเนาโฉนดที่ดินแปลงที่จอง",
    description: "ขอได้จากเซลส์โครงการ Venue Portrait Westgate",
    sortOrder: 41,
  },
  {
    docKey: "prop_map_brochure",
    category: "property",
    target: "shared",
    title: "แผนที่โครงการและผังบ้าน Venue Portrait Westgate",
    description: "โบรชัวร์และแผนที่ตั้งโครงการเพื่อส่งให้ธนาคารประเมินราคา",
    sortOrder: 42,
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
