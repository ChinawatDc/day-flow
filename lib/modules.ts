import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Frown,
  Home,
  Inbox,
  LayoutGrid,
  ListChecks,
  Meh,
  Settings,
  Smile,
  Sun,
  Users,
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
  | "journal"
  | "family"
  | "settings";

export type AppModule = {
  id: ModuleId;
  href: string;
  label: string;
  icon: LucideIcon;
};

export const modules: AppModule[] = [
  {
    id: "today",
    href: "/today",
    label: "วันนี้",
    icon: Sun,
  },
  {
    id: "inbox",
    href: "/inbox",
    label: "จดด่วน",
    icon: Inbox,
  },
  {
    id: "tasks",
    href: "/tasks",
    label: "งาน",
    icon: ListChecks,
  },
  {
    id: "money",
    href: "/money",
    label: "เงิน",
    icon: Wallet,
  },
  {
    id: "vault",
    href: "/vault",
    label: "คลัง",
    icon: Warehouse,
  },
  {
    id: "home",
    href: "/home",
    label: "บ้าน",
    icon: Home,
  },
  {
    id: "journal",
    href: "/journal",
    label: "บันทึกวัน",
    icon: BookOpen,
  },
  {
    id: "family",
    href: "/family",
    label: "ครอบครัว",
    icon: Users,
  },
];

export const hubModule: AppModule = {
  id: "hub",
  href: "/menu",
  label: "เมนู",
  icon: LayoutGrid,
};

export const settingsModule: AppModule = {
  id: "settings",
  href: "/settings",
  label: "ตั้งค่า",
  icon: Settings,
};

export const bottomNav = [modules[0], modules[1], hubModule, modules[3], modules[2]];

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
  { id: "good", label: "ดี", icon: Smile },
  { id: "ok", label: "ปกติ", icon: Meh },
  { id: "bad", label: "แย่", icon: Frown },
] as const;
