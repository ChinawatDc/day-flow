"use client";

import { useOptimistic, useState, useTransition } from "react";
import {
  Building2,
  Clock,
  ExternalLink,
  FileText,
  Home,
  Link as LinkIcon,
  Plus,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { addCustomDoc, updateBankApp, updateDocDetails, updateDocStatus } from "@/app/(app)/family/hunt/loan/actions";

type LoanDoc = {
  id: string;
  docKey: string;
  category: string;
  target: string;
  title: string;
  description: string;
  status: string;
  note: string;
  fileUrl: string | null;
};

type BankApp = {
  id: string;
  bankCode: string;
  bankName: string;
  color: string;
  status: string;
  submittedAt: string | null;
  approvedAmountSatang: number | null;
  interestRatePercent: string;
  monthlyPaymentSatang: number | null;
  contactPerson: string;
  contactPhone: string;
  note: string;
};

const BANK_STATUS_LABELS: Record<string, { label: string; class: string }> = {
  preparing: { label: "กำลังเตรียมเอกสาร", class: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  submitted: { label: "ยื่นเอกสารแล้ว", class: "bg-blue-500/15 text-blue-600 border-blue-500/30" },
  appraisal: { label: "รอประเมินหลักทรัพย์", class: "bg-purple-500/15 text-purple-600 border-purple-500/30" },
  approved: { label: "อนุมัติแล้ว 🎉", class: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 font-semibold" },
  rejected: { label: "ไม่ผ่านเกณฑ์", class: "bg-rose-500/15 text-rose-600 border-rose-500/30" },
};

// SC Asset Checklist Table Template (ตามเอกสารการจองและสัญญา SC Asset)
const SC_ASSET_REQUIREMENTS = [
  {
    no: 1,
    doc: "สำเนาบัตรประจำตัวประชาชน / บัตรข้าราชการ",
    employed: "1 ชุด (เซ็นกำกับ)",
    business: "1 ชุด (เซ็นกำกับ)",
    remark: "ทั้งผู้กู้หลัก และ ผู้กู้ร่วม",
  },
  {
    no: 2,
    doc: "สำเนาทะเบียนบ้าน",
    employed: "1 ชุด (ทุกหน้าที่มีคนอยู่)",
    business: "1 ชุด (ทุกหน้าที่มีคนอยู่)",
    remark: "ทั้งผู้กู้หลัก และ ผู้กู้ร่วม",
  },
  {
    no: 3,
    doc: "สำเนาทะเบียนสมรส / ใบหย่า / ใบมรณบัตร (ถ้ามี)",
    employed: "1 ชุด",
    business: "1 ชุด",
    remark: "กรณีสมรสจดทะเบียน / มีบุตร",
  },
  {
    no: 4,
    doc: "สำเนาใบเปลี่ยนชื่อ-สกุล (ถ้ามี)",
    employed: "1 ชุด (เซ็นกำกับ)",
    business: "1 ชุด (เซ็นกำกับ)",
    remark: "ถ้าเคยเปลี่ยนชื่อ/นามสกุล",
  },
  {
    no: 5,
    doc: "หนังสือรับรองเงินเดือน และสลิปเงินเดือน",
    employed: "สลิป 6 เดือน + หนังสือรับรอง (อายุไม่เกิน 30 วัน)",
    business: "สำเนาบัญชีกระแสรายวัน/ออมทรัพย์ ย้อนหลัง 6 เดือน",
    remark: "ธอส. ระบุ 'กู้สวัสดิการแบบไม่มีเงินฝาก'",
  },
  {
    no: 6,
    doc: "Statement บัญชีเงินเดือนย้อนหลัง 6 เดือน",
    employed: "ย้อนหลัง 6 เดือน (ขอเพิ่มเดือนโบนัสเข้า)",
    business: "งบการเงินกิจการย้อนหลัง 3 ปี (ถ้ามี)",
    remark: "ประทับตราธนาคาร",
  },
  {
    no: 7,
    doc: "สำเนาสมุดเงินฝากส่วนตัว / บัญชีเงินออม (ถ้ามี)",
    employed: "สมุดเงินฝาก / สลากออมทรัพย์",
    business: "ทะเบียนการค้า / ทะเบียนพาณิชย์",
    remark: "แสดงความมั่นคงทางการเงิน",
  },
  {
    no: 8,
    doc: "เอกสารแสดงฐานะทางการเงิน / ทรัพย์สินปลอดภาระ (ถ้ามี)",
    employed: "ทะเบียนรถ / โฉนดที่ดินปลอดภาระ",
    business: "ใบหักภาษี ณ ที่จ่าย / ภ.ง.ด. / บิลซื้อขาย",
    remark: "ช่วยเพิ่มโอกาสอนุมัติ",
  },
  {
    no: 9,
    doc: "เอกสารการเสียภาษี (ภ.ง.ด. 90/91 ปี 68 หรือ ทวิ 50)",
    employed: "ภ.ง.ด.90/91 หรือ ทวิ 50",
    business: "ภาพถ่ายกิจการ / สัญญาเช่า / สต็อกสินค้า",
    remark: "ยืนยันรายได้สุทธิรอบปี",
  },
  {
    no: 10,
    doc: "สำเนาใบอนุญาตประกอบวิชาชีพ (ถ้ามี)",
    employed: "แพทย์, วิศวกร, ทนายความ, สถาปนิก",
    business: "แพทย์, วิศวกร, ทนายความ, สถาพยาบาล",
    remark: "ได้รับเรทดอกเบี้ยวิชาชีพพิเศษ",
  },
];

export function LoanTrackerClient({
  docs,
  banks,
}: {
  docs: LoanDoc[];
  banks: BankApp[];
}) {
  const [selectedBankCode, setSelectedBankCode] = useState<string>("scb");
  const [editingBankCode, setEditingBankCode] = useState<string | null>(null);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [showAddDoc, setShowAddDoc] = useState(false);
  const [, startTransition] = useTransition();

  // Optimistic UI for checkbox checking
  const [optimisticDocs, setOptimisticDocs] = useOptimistic(
    docs,
    (state, { id, nextStatus }: { id: string; nextStatus: string }) =>
      state.map((d) => (d.id === id ? { ...d, status: nextStatus } : d)),
  );

  const selectedBank = banks.find((b) => b.bankCode === selectedBankCode) ?? banks[0];

  // Divide documents: Mine (Primary), Girlfriend's (Co-borrower), Shared Project Docs
  const myDocs = optimisticDocs.filter((d) => d.target === "primary");
  const herDocs = optimisticDocs.filter((d) => d.target === "co_borrower");
  const sharedDocs = optimisticDocs.filter((d) => d.target === "shared");

  // Stats calculation
  const totalCount = optimisticDocs.length;
  const readyCount = optimisticDocs.filter((d) => d.status === "ready" || d.status === "submitted").length;
  const myReady = myDocs.filter((d) => d.status === "ready" || d.status === "submitted").length;
  const herReady = herDocs.filter((d) => d.status === "ready" || d.status === "submitted").length;
  const sharedReady = sharedDocs.filter((d) => d.status === "ready" || d.status === "submitted").length;
  const progressPercent = totalCount > 0 ? Math.round((readyCount / totalCount) * 100) : 0;

  const handleToggleDoc = (docId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "ready" ? "pending" : "ready";
    startTransition(async () => {
      setOptimisticDocs({ id: docId, nextStatus });
      const fd = new FormData();
      fd.append("id", docId);
      fd.append("status", nextStatus);
      await updateDocStatus(fd);
    });
  };

  return (
    <div className="grid gap-6">
      {/* 1. Header Banner: Venue Portrait Westgate */}
      <section className="relative overflow-hidden rounded-2xl border border-[var(--hh-line)] bg-gradient-to-br from-[var(--hh-surface)] via-[color-mix(in_oklch,var(--hh-surface)_92%,var(--hh-gold))] to-[var(--hh-surface)] p-5 shadow-[var(--shadow-sm)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--hh-gold)]/40 bg-[var(--hh-gold-soft)] px-2.5 py-0.5 text-xs font-semibold text-[var(--hh-gold)]">
              <Sparkles className="size-3.5" /> เอกสารยื่นกู้ร่วมกับแฟน
            </div>
            <h2 className="mt-2 font-[family-name:var(--font-title)] text-2xl font-bold tracking-tight text-[var(--hh-ink)]">
              Venue Portrait Westgate
            </h2>
            <p className="text-xs text-[var(--hh-muted)] sm:text-sm">
              ระบบตรวจสอบและเตรียมเอกสารวันทำสัญญา SC Asset & เอกสารพิจารณาสินเชื่อ 4 ธนาคาร
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-[var(--hh-line)] bg-[var(--hh-canvas)] px-4 py-3">
            <div className="text-right">
              <p className="text-xs font-medium text-[var(--hh-muted)]">ความพร้อมเอกสารรวม</p>
              <p className="font-[family-name:var(--font-numeric)] text-2xl font-bold text-[var(--hh-gold)]">
                {progressPercent}%
              </p>
              <p className="text-[11px] text-[var(--hh-muted)]">
                พร้อมแล้ว {readyCount} / {totalCount} รายการ
              </p>
            </div>
            <div className="h-10 w-2.5 overflow-hidden rounded-full bg-[var(--hh-surface-2)]">
              <div
                className="w-full bg-[var(--hh-gold)] transition-all duration-500"
                style={{ height: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick Important Notice */}
        <div className="mt-4 grid gap-2 rounded-xl border border-[var(--hh-line)] bg-[var(--hh-canvas)]/70 p-3 text-xs text-[var(--hh-muted)] sm:grid-cols-2">
          <div className="flex items-start gap-2">
            <Clock className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
            <span>
              <strong>หนังสือรับรองเงินเดือน:</strong> มีอายุไม่เกิน 30 วัน (*กรณี ธอส. ระบุ &ldquo;กู้สวัสดิการแบบไม่มีเงินฝาก&rdquo;)
            </span>
          </div>
          <div className="flex items-start gap-2">
            <FileText className="mt-0.5 size-3.5 shrink-0 text-blue-500" />
            <span>
              <strong>Statement & สลิปเงินเดือน:</strong> ย้อนหลัง 6 เดือนต่อเนื่อง <em>(ขอเพิ่มเดือนที่โบนัสเข้าด้วย)</em>
            </span>
          </div>
        </div>
      </section>

      {/* 2. Bank Selection Cards (คลิกเพื่อเลือกดูและอัปเดตแต่ละธนาคาร) */}
      <section className="grid gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-[family-name:var(--font-title)] text-base font-semibold text-[var(--hh-ink)]">
              เลือกธนาคารที่ยื่นกู้ (4 ธนาคารหลัก)
            </h3>
            <p className="text-xs text-[var(--hh-muted)]">คลิกการ์ดธนาคารเพื่อดูสถานะ และบันทึกข้อเสนอ ดอกเบี้ย ยอดผ่อน</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {banks.map((bank) => {
            const isSelected = selectedBankCode === bank.bankCode;
            const statusConfig = BANK_STATUS_LABELS[bank.status] ?? BANK_STATUS_LABELS.preparing;

            return (
              <button
                key={bank.bankCode}
                type="button"
                onClick={() => setSelectedBankCode(bank.bankCode)}
                className={cn(
                  "flex flex-col items-start rounded-xl border p-3 text-left transition-all shadow-[var(--shadow-sm)] relative",
                  isSelected
                    ? "border-[var(--hh-gold)] bg-[var(--hh-gold-soft)]/25 ring-2 ring-[var(--hh-gold)]/40"
                    : "border-[var(--hh-line)] bg-[var(--hh-surface)] hover:border-[var(--hh-gold)]/50",
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <span
                    className="inline-block h-3.5 w-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: bank.color }}
                  />
                  {isSelected && (
                    <span className="text-[10px] font-bold text-[var(--hh-gold)] bg-[var(--hh-gold-soft)] px-1.5 py-0.5 rounded">
                      กำลังเลือก
                    </span>
                  )}
                </div>
                <p className="mt-2 font-[family-name:var(--font-title)] text-sm font-semibold text-[var(--hh-ink)] truncate w-full">
                  {bank.bankName}
                </p>
                <span
                  className={cn(
                    "mt-2 inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium",
                    statusConfig.class,
                  )}
                >
                  {statusConfig.label}
                </span>

                {bank.interestRatePercent ? (
                  <p className="mt-2 text-[11px] text-[var(--hh-muted)]">
                    ดอกเบี้ย: <span className="font-semibold text-[var(--hh-gold)]">{bank.interestRatePercent}%</span>
                  </p>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Selected Bank Detailed Status & Edit Form */}
        {selectedBank && (
          <div className="rounded-xl border border-[var(--hh-line)] bg-[var(--hh-surface)] p-4 shadow-[var(--shadow-sm)]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--hh-line)] pb-3">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: selectedBank.color }}
                />
                <h4 className="font-[family-name:var(--font-title)] text-base font-bold text-[var(--hh-ink)]">
                  {selectedBank.bankName}
                </h4>
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-xs font-medium",
                    (BANK_STATUS_LABELS[selectedBank.status] ?? BANK_STATUS_LABELS.preparing).class,
                  )}
                >
                  {(BANK_STATUS_LABELS[selectedBank.status] ?? BANK_STATUS_LABELS.preparing).label}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setEditingBankCode(editingBankCode === selectedBank.bankCode ? null : selectedBank.bankCode)}
                className="text-xs font-medium text-[var(--hh-gold)] underline hover:opacity-80"
              >
                {editingBankCode === selectedBank.bankCode ? "ปิดฟอร์มแก้ไข" : "✏️ แก้ไขข้อมูล / ข้อเสนอแบงก์นี้"}
              </button>
            </div>

            {/* Readonly Overview or Edit Form */}
            {editingBankCode !== selectedBank.bankCode ? (
              <div className="mt-3 grid gap-2 text-xs sm:grid-cols-4">
                <div className="rounded-lg bg-[var(--hh-canvas)] p-2.5">
                  <p className="text-[var(--hh-muted)]">วันที่ยื่นเอกสาร</p>
                  <p className="mt-0.5 font-semibold text-[var(--hh-ink)]">{selectedBank.submittedAt || "ยังไม่ได้ยื่น"}</p>
                </div>
                <div className="rounded-lg bg-[var(--hh-canvas)] p-2.5">
                  <p className="text-[var(--hh-muted)]">วงเงินอนุมัติ</p>
                  <p className="mt-0.5 font-semibold text-emerald-600">
                    {selectedBank.approvedAmountSatang
                      ? `${(selectedBank.approvedAmountSatang / 100_000_000).toFixed(2)} ล้านบาท`
                      : "รอพิจารณา"}
                  </p>
                </div>
                <div className="rounded-lg bg-[var(--hh-canvas)] p-2.5">
                  <p className="text-[var(--hh-muted)]">ดอกเบี้ยเฉลี่ย 3 ปี</p>
                  <p className="mt-0.5 font-semibold text-[var(--hh-gold)]">
                    {selectedBank.interestRatePercent ? `${selectedBank.interestRatePercent}%` : "—"}
                  </p>
                </div>
                <div className="rounded-lg bg-[var(--hh-canvas)] p-2.5">
                  <p className="text-[var(--hh-muted)]">ยอดผ่อน/เดือน</p>
                  <p className="mt-0.5 font-semibold text-[var(--hh-ink)]">
                    {selectedBank.monthlyPaymentSatang
                      ? `${(selectedBank.monthlyPaymentSatang / 100).toLocaleString("th-TH")} บาท`
                      : "—"}
                  </p>
                </div>
                {(selectedBank.contactPerson || selectedBank.note) && (
                  <div className="col-span-full rounded-lg bg-[var(--hh-canvas)] p-2.5 text-xs text-[var(--hh-muted)]">
                    {selectedBank.contactPerson && (
                      <p>
                        <strong>จนท. สินเชื่อ:</strong> {selectedBank.contactPerson} {selectedBank.contactPhone && `(${selectedBank.contactPhone})`}
                      </p>
                    )}
                    {selectedBank.note && (
                      <p className="mt-1 italic">
                        <strong>โน้ต:</strong> &ldquo;{selectedBank.note}&rdquo;
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <form action={updateBankApp} className="mt-3 grid gap-3 text-xs" onSubmit={() => setEditingBankCode(null)}>
                <input type="hidden" name="bankCode" value={selectedBank.bankCode} />
                <div className="grid gap-2 sm:grid-cols-3">
                  <div>
                    <Label className="text-[11px]">สถานะ</Label>
                    <select name="status" defaultValue={selectedBank.status} className="hh-field mt-1 h-8 text-xs">
                      <option value="preparing">กำลังเตรียมเอกสาร</option>
                      <option value="submitted">ยื่นเอกสารแล้ว</option>
                      <option value="appraisal">รอประเมินหลักทรัพย์</option>
                      <option value="approved">อนุมัติแล้ว</option>
                      <option value="rejected">ไม่ผ่านเกณฑ์</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-[11px]">วันที่ยื่น</Label>
                    <Input type="date" name="submittedAt" defaultValue={selectedBank.submittedAt || ""} className="h-8 text-xs mt-1" />
                  </div>
                  <div>
                    <Label className="text-[11px]">วงเงินอนุมัติ (ล้านบาท)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      name="approvedMillion"
                      defaultValue={selectedBank.approvedAmountSatang ? (selectedBank.approvedAmountSatang / 100_000_000).toString() : ""}
                      placeholder="เช่น 5.99"
                      className="h-8 text-xs mt-1"
                    />
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <div>
                    <Label className="text-[11px]">ดอกเบี้ยเฉลี่ย 3 ปี (%)</Label>
                    <Input
                      type="text"
                      name="interestRatePercent"
                      defaultValue={selectedBank.interestRatePercent}
                      placeholder="เช่น 2.99"
                      className="h-8 text-xs mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px]">ยอดผ่อนต่อเดือน (บาท)</Label>
                    <Input
                      type="number"
                      name="monthlyPayment"
                      defaultValue={selectedBank.monthlyPaymentSatang ? (selectedBank.monthlyPaymentSatang / 100).toString() : ""}
                      placeholder="เช่น 24000"
                      className="h-8 text-xs mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px]">เจ้าหน้าที่ / เบอร์ติดต่อ</Label>
                    <div className="flex gap-1 mt-1">
                      <Input
                        type="text"
                        name="contactPerson"
                        defaultValue={selectedBank.contactPerson}
                        placeholder="ชื่อ จนท."
                        className="h-8 text-xs"
                      />
                      <Input
                        type="text"
                        name="contactPhone"
                        defaultValue={selectedBank.contactPhone}
                        placeholder="เบอร์"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-[11px]">เงื่อนไข / โน้ตเพิ่มเติม</Label>
                  <Input
                    type="text"
                    name="note"
                    defaultValue={selectedBank.note}
                    placeholder="เช่น ฟรีค่าประเมิน, บังคับทำประกัน MRTA 10 ปี"
                    className="h-8 text-xs mt-1"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <Button type="button" variant="outline" size="sm" onClick={() => setEditingBankCode(null)}>
                    ยกเลิก
                  </Button>
                  <Button type="submit" size="sm">
                    บันทึกข้อมูล
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </section>

      {/* 3. SC Asset Checklist Reference Table (ตารางแสดงรายการของผู้พัฒนาโครงการ) */}
      <section className="rounded-2xl border border-[var(--hh-line)] bg-[var(--hh-surface)] p-5 shadow-[var(--shadow-sm)]">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-1.5 font-[family-name:var(--font-title)] text-base font-bold text-[var(--hh-ink)]">
              <Building2 className="size-4 text-[var(--hh-gold)]" />
              รายการเอกสารของผู้พัฒนา (SC Asset) ในวันทำสัญญา
            </div>
            <p className="text-xs text-[var(--hh-muted)]">
              เกณฑ์เอกสารพิจารณาสินเชื่อในวันทำสัญญา ทั้งผู้กู้หลักและผู้กู้ร่วม (เซ็นชื่อรับรองสำเนาถูกต้องทุกใบ)
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="hh-table text-xs">
            <thead>
              <tr className="bg-[var(--hh-canvas)]">
                <th className="w-10 text-center">ลำดับ</th>
                <th className="min-w-[180px]">เอกสารที่ต้องเตรียม</th>
                <th className="min-w-[170px]">กรณีรายได้ประจำ (พนักงานบริษัท)</th>
                <th className="min-w-[170px]">กรณีเจ้าของกิจการ</th>
                <th className="min-w-[140px]">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody>
              {SC_ASSET_REQUIREMENTS.map((item) => (
                <tr key={item.no}>
                  <td className="text-center font-semibold text-[var(--hh-muted)]">{item.no}</td>
                  <td className="font-medium text-[var(--hh-ink)]">{item.doc}</td>
                  <td className="text-[var(--hh-ink)]">{item.employed}</td>
                  <td className="text-[var(--hh-muted)]">{item.business}</td>
                  <td className="text-[var(--hh-gold)]">{item.remark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Split Screen Checklists: แบ่งของผม (ผู้กู้หลัก) & ของแฟน (ผู้กู้ร่วม) อย่างละแถบ/ครึ่งหน้า */}
      <section className="grid gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-[family-name:var(--font-title)] text-lg font-bold text-[var(--hh-ink)]">
              Checklist ตรวจสอบเอกสาร (กด Check ได้ทันที)
            </h3>
            <p className="text-xs text-[var(--hh-muted)]">
              แยกหน้าฝั่งของผมและของแฟนชัดเจน กด Check เมื่อเตรียมเอกสารเสร็จแล้ว
            </p>
          </div>

          <button
            onClick={() => setShowAddDoc(!showAddDoc)}
            className="hh-btn-soft flex h-8 items-center gap-1.5 self-start sm:self-auto rounded-lg px-3 text-xs font-medium"
          >
            <Plus className="size-3.5" /> เพิ่มเอกสารเอง
          </button>
        </div>

        {/* Add custom doc form */}
        {showAddDoc && (
          <form
            action={addCustomDoc}
            onSubmit={() => setShowAddDoc(false)}
            className="rounded-xl border border-[var(--hh-line)] bg-[var(--hh-surface)] p-4 text-xs shadow-[var(--shadow-sm)]"
          >
            <p className="mb-2 font-semibold text-[var(--hh-ink)]">เพิ่มเอกสารเพิ่มเติม</p>
            <div className="grid gap-2 sm:grid-cols-3">
              <div>
                <Label className="text-xs">ชื่อเอกสาร</Label>
                <Input name="title" required placeholder="เช่น สัญญาผ่อนเดิม" className="h-8 text-xs mt-1" />
              </div>
              <div>
                <Label className="text-xs">ฝั่งผู้ยื่น</Label>
                <select name="target" className="hh-field mt-1 h-8 text-xs">
                  <option value="primary">ของผม (ผู้กู้หลัก)</option>
                  <option value="co_borrower">ของแฟน (ผู้กู้ร่วม)</option>
                  <option value="shared">เอกสารโครงการ</option>
                </select>
              </div>
              <div>
                <Label className="text-xs">หมวดหมู่</Label>
                <select name="category" className="hh-field mt-1 h-8 text-xs">
                  <option value="personal">เอกสารส่วนตัว</option>
                  <option value="income">เอกสารรายได้</option>
                  <option value="asset">ทรัพย์สิน / เงินออม</option>
                  <option value="property">เอกสารโครงการ</option>
                </select>
              </div>
            </div>
            <div className="mt-2">
              <Label className="text-xs">คำอธิบาย</Label>
              <Input name="description" placeholder="รายละเอียดหรือโน้ตเพิ่มเติม" className="h-8 text-xs mt-1" />
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddDoc(false)}>
                ยกเลิก
              </Button>
              <Button type="submit" size="sm">
                บันทึก
              </Button>
            </div>
          </form>
        )}

        {/* 2-Column Split Layout: ของผม (Left) vs ของแฟน (Right) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* ฝั่งซ้าย: ของผม (ผู้กู้หลัก) */}
          <div className="rounded-2xl border border-[var(--hh-line)] bg-[var(--hh-surface)] p-4 shadow-[var(--shadow-sm)] flex flex-col">
            <div className="flex items-center justify-between border-b border-[var(--hh-line)] pb-3">
              <div className="flex items-center gap-2">
                <div className="grid size-8 place-items-center rounded-full bg-[var(--hh-gold-soft)] text-[var(--hh-gold)] font-bold">
                  <User className="size-4" />
                </div>
                <div>
                  <h4 className="font-[family-name:var(--font-title)] text-base font-bold text-[var(--hh-ink)]">
                    เอกสารของผม (ผู้กู้หลัก)
                  </h4>
                  <p className="text-[11px] text-[var(--hh-muted)]">พนักงานประจำ / สัญญาจ้าง</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-[var(--hh-gold)]">
                  {myReady} / {myDocs.length} พร้อมแล้ว
                </span>
              </div>
            </div>

            {/* Checklist items */}
            <div className="mt-3 divide-y divide-[var(--hh-line)]">
              {myDocs.map((doc) => {
                const isChecked = doc.status === "ready" || doc.status === "submitted";
                const isEditing = editingDocId === doc.id;

                return (
                  <div key={doc.id} className="py-2.5 first:pt-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      {/* Interactive Checkbox */}
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleDoc(doc.id, doc.status)}
                        className="mt-1 size-4.5 cursor-pointer rounded border-[var(--hh-line)] text-[var(--hh-gold)] focus:ring-[var(--hh-gold)] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <label
                            onClick={() => handleToggleDoc(doc.id, doc.status)}
                            className={cn(
                              "text-xs font-semibold cursor-pointer select-none",
                              isChecked ? "text-emerald-700 line-through opacity-85" : "text-[var(--hh-ink)]",
                            )}
                          >
                            {doc.title}
                          </label>
                          <span
                            className={cn(
                              "rounded px-1.5 py-0.2 text-[10px] font-medium border",
                              isChecked
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-600 border-amber-500/20",
                            )}
                          >
                            {isChecked ? "พร้อมแล้ว ✓" : "ยังไม่เสร็จ"}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--hh-muted)] mt-0.5">{doc.description}</p>

                        {/* Note & File Link */}
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                          {doc.fileUrl && (
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[var(--hh-gold)] hover:underline font-medium"
                            >
                              <LinkIcon className="size-3" /> ดูไฟล์แนบ
                              <ExternalLink className="size-2.5" />
                            </a>
                          )}
                          {doc.note && (
                            <span className="text-[var(--hh-muted)] italic">
                              โน้ต: {doc.note}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => setEditingDocId(isEditing ? null : doc.id)}
                            className="text-[10px] text-[var(--hh-muted)] hover:text-[var(--hh-gold)] underline ml-auto"
                          >
                            {isEditing ? "ปิด" : "ใส่ลิงก์/โน้ต"}
                          </button>
                        </div>

                        {/* Inline Form for Note / Link */}
                        {isEditing && (
                          <form
                            action={updateDocDetails}
                            onSubmit={() => setEditingDocId(null)}
                            className="mt-2 grid gap-1.5 rounded-lg border border-[var(--hh-line)] bg-[var(--hh-canvas)] p-2 text-xs"
                          >
                            <input type="hidden" name="id" value={doc.id} />
                            <Input
                              type="url"
                              name="fileUrl"
                              defaultValue={doc.fileUrl || ""}
                              placeholder="ลิงก์ไฟล์ Drive / เอกสาร"
                              className="h-7 text-xs"
                            />
                            <Input
                              type="text"
                              name="note"
                              defaultValue={doc.note}
                              placeholder="โน้ตช่วยจำ (เช่น เซ็นแล้ว, ขอเมื่อวาน)"
                              className="h-7 text-xs"
                            />
                            <div className="flex justify-end gap-1">
                              <Button type="button" variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => setEditingDocId(null)}>
                                ยกเลิก
                              </Button>
                              <Button type="submit" size="sm" className="h-6 text-[10px]">
                                บันทึก
                              </Button>
                            </div>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ฝั่งขวา: ของแฟน (ผู้กู้ร่วม) */}
          <div className="rounded-2xl border border-[var(--hh-line)] bg-[var(--hh-surface)] p-4 shadow-[var(--shadow-sm)] flex flex-col">
            <div className="flex items-center justify-between border-b border-[var(--hh-line)] pb-3">
              <div className="flex items-center gap-2">
                <div className="grid size-8 place-items-center rounded-full bg-rose-500/15 text-rose-600 font-bold">
                  <Users className="size-4" />
                </div>
                <div>
                  <h4 className="font-[family-name:var(--font-title)] text-base font-bold text-[var(--hh-ink)]">
                    เอกสารของแฟน (ผู้กู้ร่วม)
                  </h4>
                  <p className="text-[11px] text-[var(--hh-muted)]">พนักงานประจำ / คู่สมรส</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-rose-600">
                  {herReady} / {herDocs.length} พร้อมแล้ว
                </span>
              </div>
            </div>

            {/* Checklist items */}
            <div className="mt-3 divide-y divide-[var(--hh-line)]">
              {herDocs.map((doc) => {
                const isChecked = doc.status === "ready" || doc.status === "submitted";
                const isEditing = editingDocId === doc.id;

                return (
                  <div key={doc.id} className="py-2.5 first:pt-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      {/* Interactive Checkbox */}
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleDoc(doc.id, doc.status)}
                        className="mt-1 size-4.5 cursor-pointer rounded border-[var(--hh-line)] text-rose-600 focus:ring-rose-500 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <label
                            onClick={() => handleToggleDoc(doc.id, doc.status)}
                            className={cn(
                              "text-xs font-semibold cursor-pointer select-none",
                              isChecked ? "text-emerald-700 line-through opacity-85" : "text-[var(--hh-ink)]",
                            )}
                          >
                            {doc.title}
                          </label>
                          <span
                            className={cn(
                              "rounded px-1.5 py-0.2 text-[10px] font-medium border",
                              isChecked
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-600 border-amber-500/20",
                            )}
                          >
                            {isChecked ? "พร้อมแล้ว ✓" : "ยังไม่เสร็จ"}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--hh-muted)] mt-0.5">{doc.description}</p>

                        {/* Note & File Link */}
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                          {doc.fileUrl && (
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[var(--hh-gold)] hover:underline font-medium"
                            >
                              <LinkIcon className="size-3" /> ดูไฟล์แนบ
                              <ExternalLink className="size-2.5" />
                            </a>
                          )}
                          {doc.note && (
                            <span className="text-[var(--hh-muted)] italic">
                              โน้ต: {doc.note}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => setEditingDocId(isEditing ? null : doc.id)}
                            className="text-[10px] text-[var(--hh-muted)] hover:text-[var(--hh-gold)] underline ml-auto"
                          >
                            {isEditing ? "ปิด" : "ใส่ลิงก์/โน้ต"}
                          </button>
                        </div>

                        {/* Inline Form for Note / Link */}
                        {isEditing && (
                          <form
                            action={updateDocDetails}
                            onSubmit={() => setEditingDocId(null)}
                            className="mt-2 grid gap-1.5 rounded-lg border border-[var(--hh-line)] bg-[var(--hh-canvas)] p-2 text-xs"
                          >
                            <input type="hidden" name="id" value={doc.id} />
                            <Input
                              type="url"
                              name="fileUrl"
                              defaultValue={doc.fileUrl || ""}
                              placeholder="ลิงก์ไฟล์ Drive / เอกสาร"
                              className="h-7 text-xs"
                            />
                            <Input
                              type="text"
                              name="note"
                              defaultValue={doc.note}
                              placeholder="โน้ตช่วยจำของแฟน"
                              className="h-7 text-xs"
                            />
                            <div className="flex justify-end gap-1">
                              <Button type="button" variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => setEditingDocId(null)}>
                                ยกเลิก
                              </Button>
                              <Button type="submit" size="sm" className="h-6 text-[10px]">
                                บันทึก
                              </Button>
                            </div>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* เอกสารโครงการ Venue Portrait Westgate (Shared) */}
        <div className="rounded-2xl border border-[var(--hh-line)] bg-[var(--hh-surface)] p-4 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between border-b border-[var(--hh-line)] pb-3">
            <div className="flex items-center gap-2">
              <div className="grid size-8 place-items-center rounded-full bg-blue-500/15 text-blue-600 font-bold">
                <Home className="size-4" />
              </div>
              <div>
                <h4 className="font-[family-name:var(--font-title)] text-base font-bold text-[var(--hh-ink)]">
                  เอกสารการจองและโครงการ SC Asset (Venue Portrait Westgate)
                </h4>
                <p className="text-[11px] text-[var(--hh-muted)]">เอกสารหลักประกันที่ต้องใช้ยื่นธนาคาร</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-blue-600">
                {sharedReady} / {sharedDocs.length} พร้อมแล้ว
              </span>
            </div>
          </div>

          <div className="mt-3 divide-y divide-[var(--hh-line)]">
            {sharedDocs.map((doc) => {
              const isChecked = doc.status === "ready" || doc.status === "submitted";

              return (
                <div key={doc.id} className="py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleDoc(doc.id, doc.status)}
                      className="mt-1 size-4.5 cursor-pointer rounded border-[var(--hh-line)] text-blue-600 focus:ring-blue-500 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <label
                          onClick={() => handleToggleDoc(doc.id, doc.status)}
                          className={cn(
                            "text-xs font-semibold cursor-pointer select-none",
                            isChecked ? "text-emerald-700 line-through opacity-85" : "text-[var(--hh-ink)]",
                          )}
                        >
                          {doc.title}
                        </label>
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.2 text-[10px] font-medium border",
                            isChecked
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-600 border-amber-500/20",
                          )}
                        >
                          {isChecked ? "พร้อมแล้ว ✓" : "ยังไม่เสร็จ"}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--hh-muted)] mt-0.5">{doc.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
