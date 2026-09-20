"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  FileClock,
  FileText,
  Home,
  Link as LinkIcon,
  Plus,
  Send,
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

export function LoanTrackerClient({
  docs,
  banks,
}: {
  docs: LoanDoc[];
  banks: BankApp[];
}) {
  const [activeTab, setActiveTab] = useState<"all" | "primary" | "co_borrower" | "shared">("all");
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [showAddDoc, setShowAddDoc] = useState(false);
  const [editingBankCode, setEditingBankCode] = useState<string | null>(null);

  // Stats
  const totalDocs = docs.length;
  const readyDocs = docs.filter((d) => d.status === "ready" || d.status === "submitted").length;
  const progressPercent = totalDocs > 0 ? Math.round((readyDocs / totalDocs) * 100) : 0;

  const filteredDocs = activeTab === "all" ? docs : docs.filter((d) => d.target === activeTab);

  return (
    <div className="grid gap-6">
      {/* Hero Banner for Venue Portrait Westgate */}
      <section className="relative overflow-hidden rounded-2xl border border-[var(--hh-line)] bg-gradient-to-br from-[var(--hh-surface)] via-[color-mix(in_oklch,var(--hh-surface)_90%,var(--hh-gold))] to-[var(--hh-surface)] p-5 shadow-[var(--shadow-sm)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--hh-gold)]/40 bg-[var(--hh-gold-soft)] px-2.5 py-0.5 text-xs font-semibold text-[var(--hh-gold)]">
              <Sparkles className="size-3.5" /> ยื่นกู้ร่วมกับแฟน
            </div>
            <h2 className="mt-2 font-[family-name:var(--font-title)] text-xl font-bold tracking-tight text-[var(--hh-ink)]">
              Venue Portrait Westgate
            </h2>
            <p className="text-xs text-[var(--hh-muted)] sm:text-sm">
              เตรียมเอกสารยื่นกู้ 4 ธนาคาร: SCB, ธอส., กรุงไทย, กสิกรไทย
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-[var(--hh-line)] bg-[var(--hh-canvas)] px-4 py-3">
            <div className="text-right">
              <p className="text-xs font-medium text-[var(--hh-muted)]">ความพร้อมเอกสาร</p>
              <p className="font-[family-name:var(--font-numeric)] text-2xl font-bold text-[var(--hh-gold)]">
                {progressPercent}%
              </p>
              <p className="text-[11px] text-[var(--hh-muted)]">
                {readyDocs} จาก {totalDocs} รายการ
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

        {/* Quick Tips */}
        {/* Quick Tips from SC Asset & SCB */}
        <div className="mt-4 grid gap-2 rounded-xl border border-[var(--hh-line)] bg-[var(--hh-canvas)]/60 p-3 text-xs text-[var(--hh-muted)] sm:grid-cols-2">
          <div className="flex items-start gap-2">
            <Clock className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
            <span>
              <strong>หนังสือรับรองเงินเดือน:</strong> อายุไม่เกิน 30 วัน (*กรณีกู้สวัสดิการ ธอส. ระบุ &ldquo;กู้สวัสดิการแบบไม่มีเงินฝาก&rdquo;)
            </span>
          </div>
          <div className="flex items-start gap-2">
            <FileText className="mt-0.5 size-3.5 shrink-0 text-blue-500" />
            <span>
              <strong>Statement & สลิปเงินเดือน 6 เดือน:</strong> ขอเพิ่มเดือนที่โบนัสเข้าด้วย พร้อมประทับตราธนาคาร
            </span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
            <span>
              <strong>การเซ็นสำเนา:</strong> เซ็นกำกับรับรองสำเนาถูกต้องทุกใบ ทั้งผู้กู้หลักและผู้กู้ร่วม (คู่สมรส)
            </span>
          </div>
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-[var(--hh-gold)]" />
            <span>
              <strong>ภาษี & เงินออม:</strong> ภ.ง.ด.90/91 ปี 68, ทวิ 50 และทรัพย์สินปลอดภาระ (ถ้ามีช่วยให้ผ่านง่ายขึ้น)
            </span>
          </div>
        </div>
      </section>

      {/* 4 Banks Status Matrix */}
      <section className="grid gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-[family-name:var(--font-title)] text-base font-semibold text-[var(--hh-ink)]">
              สถานะการยื่น 4 ธนาคาร
            </h3>
            <p className="text-xs text-[var(--hh-muted)]">อัปเดตผลการพิจารณา ข้อเสนอดอกเบี้ย และยอดผ่อนต่อเดือน</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {banks.map((bank) => {
            const statusConfig = BANK_STATUS_LABELS[bank.status] ?? BANK_STATUS_LABELS.preparing;
            const isEditing = editingBankCode === bank.bankCode;

            return (
              <div
                key={bank.bankCode}
                className="flex flex-col justify-between rounded-xl border border-[var(--hh-line)] bg-[var(--hh-surface)] p-4 shadow-[var(--shadow-sm)]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="inline-block h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: bank.color }}
                    />
                    <span className="truncate font-[family-name:var(--font-title)] text-sm font-semibold text-[var(--hh-ink)]">
                      {bank.bankName}
                    </span>
                    <button
                      onClick={() => setEditingBankCode(isEditing ? null : bank.bankCode)}
                      className="text-xs text-[var(--hh-muted)] hover:text-[var(--hh-gold)] ml-auto underline"
                    >
                      {isEditing ? "ปิด" : "แก้ไข"}
                    </button>
                  </div>

                  <div className="mt-2.5">
                    <span
                      className={cn(
                        "inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
                        statusConfig.class,
                      )}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Bank Details View */}
                  {!isEditing ? (
                    <div className="mt-3 space-y-1.5 text-xs">
                      {bank.submittedAt && (
                        <p className="text-[var(--hh-muted)]">
                          ยื่นเมื่อ: <span className="text-[var(--hh-ink)]">{bank.submittedAt}</span>
                        </p>
                      )}
                      {bank.approvedAmountSatang && (
                        <p className="text-[var(--hh-muted)]">
                          วงเงิน:{" "}
                          <span className="font-semibold text-emerald-600">
                            {(bank.approvedAmountSatang / 100_000_000).toFixed(2)} ล้านบาท
                          </span>
                        </p>
                      )}
                      {bank.interestRatePercent && (
                        <p className="text-[var(--hh-muted)]">
                          ดอกเบี้ยเฉลี่ย 3 ปี:{" "}
                          <span className="font-medium text-[var(--hh-gold)]">{bank.interestRatePercent}%</span>
                        </p>
                      )}
                      {bank.monthlyPaymentSatang && (
                        <p className="text-[var(--hh-muted)]">
                          ผ่อน/เดือน:{" "}
                          <span className="font-medium text-[var(--hh-ink)]">
                            {(bank.monthlyPaymentSatang / 100).toLocaleString("th-TH")} บาท
                          </span>
                        </p>
                      )}
                      {bank.contactPerson && (
                        <p className="flex items-center gap-1 text-[var(--hh-muted)]">
                          <User className="size-3" /> {bank.contactPerson} {bank.contactPhone && `(${bank.contactPhone})`}
                        </p>
                      )}
                      {bank.note && (
                        <p className="rounded bg-[var(--hh-canvas)] p-1.5 text-[11px] text-[var(--hh-muted)] italic">
                          &ldquo;{bank.note}&rdquo;
                        </p>
                      )}
                    </div>
                  ) : (
                    /* Bank Details Edit Form */
                    <form action={updateBankApp} className="mt-3 space-y-2 text-xs" onSubmit={() => setEditingBankCode(null)}>
                      <input type="hidden" name="bankCode" value={bank.bankCode} />
                      <div>
                        <Label className="text-[11px]">สถานะ</Label>
                        <select
                          name="status"
                          defaultValue={bank.status}
                          className="hh-field mt-1 h-8 text-xs"
                        >
                          <option value="preparing">กำลังเตรียมเอกสาร</option>
                          <option value="submitted">ยื่นเอกสารแล้ว</option>
                          <option value="appraisal">รอประเมินหลักทรัพย์</option>
                          <option value="approved">อนุมัติแล้ว</option>
                          <option value="rejected">ไม่ผ่านเกณฑ์</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-[11px]">วันที่ยื่น</Label>
                        <Input
                          type="date"
                          name="submittedAt"
                          defaultValue={bank.submittedAt || ""}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px]">วงเงินอนุมัติ (ล้านบาท)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          name="approvedMillion"
                          defaultValue={bank.approvedAmountSatang ? (bank.approvedAmountSatang / 100_000_000).toString() : ""}
                          placeholder="เช่น 5.99"
                          className="h-8 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px]">ดอกเบี้ยเฉลี่ย 3 ปี (%)</Label>
                        <Input
                          type="text"
                          name="interestRatePercent"
                          defaultValue={bank.interestRatePercent}
                          placeholder="เช่น 2.99"
                          className="h-8 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px]">ยอดผ่อนต่อเดือน (บาท)</Label>
                        <Input
                          type="number"
                          name="monthlyPayment"
                          defaultValue={bank.monthlyPaymentSatang ? (bank.monthlyPaymentSatang / 100).toString() : ""}
                          placeholder="เช่น 24000"
                          className="h-8 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px]">เจ้าหน้าที่ / เบอร์ติดต่อ</Label>
                        <div className="flex gap-1">
                          <Input
                            type="text"
                            name="contactPerson"
                            defaultValue={bank.contactPerson}
                            placeholder="ชื่อ จนท."
                            className="h-8 text-xs"
                          />
                          <Input
                            type="text"
                            name="contactPhone"
                            defaultValue={bank.contactPhone}
                            placeholder="เบอร์"
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-[11px]">บันทึกเพิ่มเติม</Label>
                        <Input
                          type="text"
                          name="note"
                          defaultValue={bank.note}
                          placeholder="โปรโมชั่น / เงื่อนไข"
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="pt-1 flex gap-1">
                        <Button type="submit" size="sm" className="h-7 w-full text-xs">
                          บันทึก
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Checklist Filter Tabs */}
      <section className="grid gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="font-[family-name:var(--font-title)] text-base font-semibold text-[var(--hh-ink)]">
              รายการเอกสารที่ต้องใช้
            </h3>
            <p className="text-xs text-[var(--hh-muted)]">
              เช็คเอกสารที่พร้อมแล้ว หรือยังขาด พร้อมแนบลิงก์ไฟล์จัดเก็บ
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddDoc(!showAddDoc)}
              className="hh-btn-soft flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium"
            >
              <Plus className="size-3.5" /> เพิ่มเอกสาร
            </button>
          </div>
        </div>

        {/* Add custom doc inline form */}
        {showAddDoc && (
          <form
            action={addCustomDoc}
            onSubmit={() => setShowAddDoc(false)}
            className="rounded-xl border border-[var(--hh-line)] bg-[var(--hh-surface)] p-4 shadow-[var(--shadow-sm)]"
          >
            <p className="mb-2 font-medium text-xs text-[var(--hh-ink)]">เพิ่มเอกสารเพิ่มเติม</p>
            <div className="grid gap-2 sm:grid-cols-3">
              <div>
                <Label className="text-xs">ชื่อเอกสาร</Label>
                <Input name="title" required placeholder="เช่น สัญญาเงินกู้เดิม" className="h-8 text-xs mt-1" />
              </div>
              <div>
                <Label className="text-xs">ฝั่งผู้ยื่น</Label>
                <select name="target" className="hh-field mt-1 h-8 text-xs">
                  <option value="primary">ผู้กู้หลัก</option>
                  <option value="co_borrower">ผู้กู้ร่วม (แฟน)</option>
                  <option value="shared">โครงการ / ส่วนกลาง</option>
                </select>
              </div>
              <div>
                <Label className="text-xs">หมวดหมู่</Label>
                <select name="category" className="hh-field mt-1 h-8 text-xs">
                  <option value="personal">เอกสารส่วนตัว</option>
                  <option value="income">เอกสารรายได้</option>
                  <option value="debt">เอกสารภาระหนี้</option>
                  <option value="property">เอกสารโครงการ</option>
                </select>
              </div>
            </div>
            <div className="mt-2">
              <Label className="text-xs">คำอธิบาย</Label>
              <Input name="description" placeholder="รายละเอียดของเอกสารนี้" className="h-8 text-xs mt-1" />
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

        {/* Tabs Filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("all")}
            className={cn(
              "hh-chip flex items-center gap-1.5",
              activeTab === "all" && "hh-chip-on",
            )}
          >
            ทั้งหมด ({docs.length})
          </button>
          <button
            onClick={() => setActiveTab("primary")}
            className={cn(
              "hh-chip flex items-center gap-1.5",
              activeTab === "primary" && "hh-chip-on",
            )}
          >
            <User className="size-3.5" /> ผู้กู้หลัก ({docs.filter((d) => d.target === "primary").length})
          </button>
          <button
            onClick={() => setActiveTab("co_borrower")}
            className={cn(
              "hh-chip flex items-center gap-1.5",
              activeTab === "co_borrower" && "hh-chip-on",
            )}
          >
            <Users className="size-3.5" /> ผู้กู้ร่วม (แฟน) ({docs.filter((d) => d.target === "co_borrower").length})
          </button>
          <button
            onClick={() => setActiveTab("shared")}
            className={cn(
              "hh-chip flex items-center gap-1.5",
              activeTab === "shared" && "hh-chip-on",
            )}
          >
            <Home className="size-3.5" /> เอกสารโครงการ ({docs.filter((d) => d.target === "shared").length})
          </button>
        </div>

        {/* Documents List */}
        <div className="grid gap-2">
          {filteredDocs.map((doc) => {
            const isReady = doc.status === "ready";
            const isSubmitted = doc.status === "submitted";
            const isPending = doc.status === "pending";
            const isEditing = editingDocId === doc.id;

            return (
              <div
                key={doc.id}
                className={cn(
                  "rounded-xl border border-[var(--hh-line)] bg-[var(--hh-surface)] p-3.5 transition-all shadow-[var(--shadow-sm)]",
                  isReady && "border-emerald-500/40 bg-emerald-500/[0.02]",
                  isSubmitted && "border-blue-500/40 bg-blue-500/[0.02]",
                )}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    {/* Status Toggle Button */}
                    <form action={updateDocStatus} className="mt-0.5">
                      <input type="hidden" name="id" value={doc.id} />
                      <input
                        type="hidden"
                        name="status"
                        value={isPending ? "ready" : isReady ? "submitted" : "pending"}
                      />
                      <button
                        type="submit"
                        title="คลิกเพื่อเปลี่ยนสถานะ: ยังไม่เสร็จ -> พร้อมแล้ว -> ส่งแล้ว"
                        className={cn(
                          "grid size-7 place-items-center rounded-lg border transition-colors",
                          isPending && "border-[var(--hh-line)] bg-[var(--hh-canvas)] text-[var(--hh-muted)] hover:border-emerald-500 hover:text-emerald-500",
                          isReady && "border-emerald-500 bg-emerald-500 text-white shadow-sm",
                          isSubmitted && "border-blue-500 bg-blue-500 text-white shadow-sm",
                        )}
                      >
                        {isPending ? (
                          <FileClock className="size-4" />
                        ) : isReady ? (
                          <CheckCircle2 className="size-4" />
                        ) : (
                          <Send className="size-4" />
                        )}
                      </button>
                    </form>

                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm font-semibold text-[var(--hh-ink)]">{doc.title}</span>
                        <span className="rounded bg-[var(--hh-canvas)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--hh-muted)]">
                          {doc.target === "primary" ? "ผู้กู้หลัก" : doc.target === "co_borrower" ? "ผู้กู้ร่วม/แฟน" : "โครงการ"}
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.2 text-[10px] font-medium border",
                            isPending && "bg-amber-500/10 text-amber-600 border-amber-500/20",
                            isReady && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                            isSubmitted && "bg-blue-500/10 text-blue-600 border-blue-500/20",
                          )}
                        >
                          {isPending ? "ยังไม่ได้เตรียม" : isReady ? "พร้อมแล้ว ✓" : "ยื่นแบงก์แล้ว ✓✓"}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-[var(--hh-muted)]">{doc.description}</p>

                      {/* Attached link or note */}
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                        {doc.fileUrl && (
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[var(--hh-gold)] hover:underline font-medium"
                          >
                            <LinkIcon className="size-3.5" /> เปิดดูไฟล์ / Drive
                            <ExternalLink className="size-3" />
                          </a>
                        )}
                        {doc.note && (
                          <span className="text-[var(--hh-muted)] italic">
                            โน้ต: {doc.note}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => setEditingDocId(isEditing ? null : doc.id)}
                      className="text-xs text-[var(--hh-muted)] hover:text-[var(--hh-gold)] underline"
                    >
                      {isEditing ? "ปิด" : "ใส่ลิงก์/โน้ต"}
                    </button>
                  </div>
                </div>

                {/* Inline Edit Form for Note and Link */}
                {isEditing && (
                  <form
                    action={updateDocDetails}
                    onSubmit={() => setEditingDocId(null)}
                    className="mt-3 grid gap-2 rounded-lg border border-[var(--hh-line)] bg-[var(--hh-canvas)] p-3 text-xs"
                  >
                    <input type="hidden" name="id" value={doc.id} />
                    <div>
                      <Label className="text-[11px]">ลิงก์ไฟล์เอกสาร (Google Drive / iCloud / R2)</Label>
                      <Input
                        type="url"
                        name="fileUrl"
                        defaultValue={doc.fileUrl || ""}
                        placeholder="https://drive.google.com/..."
                        className="h-8 text-xs mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px]">บันทึกช่วยจำ (เช่น ฉบับจริงอยู่ที่ไหน, วันที่ขอ)</Label>
                      <Input
                        type="text"
                        name="note"
                        defaultValue={doc.note}
                        placeholder="เช่น ขอแล้วเมื่อวาน รอประทับตรา"
                        className="h-8 text-xs mt-1"
                      />
                    </div>
                    <div className="flex justify-end gap-1.5 pt-1">
                      <Button type="button" variant="outline" size="sm" onClick={() => setEditingDocId(null)}>
                        ยกเลิก
                      </Button>
                      <Button type="submit" size="sm">
                        บันทึก
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
