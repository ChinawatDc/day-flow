import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Home,
  Inbox,
  LayoutGrid,
  ListChecks,
  Sun,
  Wallet,
  Warehouse,
} from "lucide-react";

export type ModuleId =
  | "hub"
  | "today"
  | "inbox"
  | "tasks"
  | "money"
  | "vault"
  | "home"
  | "journal";

export type AppModule = {
  id: ModuleId;
  href: string;
  label: string;
  blurb: string;
  icon: LucideIcon;
};

export const modules: AppModule[] = [
  {
    id: "today",
    href: "/today",
    label: "วันนี้",
    blurb: "งานค้าง ยอดจ่าย Inbox และบันทึกของวัน",
    icon: Sun,
  },
  {
    id: "inbox",
    href: "/inbox",
    label: "จดด่วน",
    blurb: "โยนข้อความหรือรูป แล้วค่อยจัด",
    icon: Inbox,
  },
  {
    id: "tasks",
    href: "/tasks",
    label: "งาน",
    blurb: "สิ่งที่ต้องทำให้เสร็จ",
    icon: ListChecks,
  },
  {
    id: "money",
    href: "/money",
    label: "เงิน",
    blurb: "รายจ่ายและใบเสร็จ",
    icon: Wallet,
  },
  {
    id: "vault",
    href: "/vault",
    label: "คลัง",
    blurb: "บัตร ประกัน สัญญา",
    icon: Warehouse,
  },
  {
    id: "home",
    href: "/home",
    label: "บ้าน",
    blurb: "ของในบ้าน รายการซื้อ บิล",
    icon: Home,
  },
  {
    id: "journal",
    href: "/journal",
    label: "บันทึกวัน",
    blurb: "ข้อความ อารมณ์ รูปของวัน",
    icon: BookOpen,
  },
];

export const hubModule: AppModule = {
  id: "hub",
  href: "/",
  label: "ฮับ",
  blurb: "เมนูทั้งหมด",
  icon: LayoutGrid,
};

export const bottomNav = [hubModule, modules[0], modules[1], modules[3]];

export const expenseCategories = [
  { id: "food", label: "อาหาร" },
  { id: "transit", label: "เดินทาง" },
  { id: "stuff", label: "ของใช้" },
  { id: "bills", label: "บิล" },
  { id: "other", label: "อื่นๆ" },
] as const;

export const vaultKinds = [
  { id: "id", label: "บัตร" },
  { id: "insurance", label: "ประกัน" },
  { id: "contract", label: "สัญญา" },
  { id: "other", label: "อื่นๆ" },
] as const;

export const moods = [
  { id: "good", label: "ดี" },
  { id: "ok", label: "ปกติ" },
  { id: "bad", label: "แย่" },
] as const;
