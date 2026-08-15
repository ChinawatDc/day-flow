"use client";

import { useMemo, useState } from "react";
import { FileText, ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

function guessKind(key: string): "image" | "pdf" | "other" {
  const lower = key.toLowerCase();
  if (/\.(png|jpe?g|gif|webp|avif|bmp|svg)$/.test(lower)) return "image";
  if (lower.endsWith(".pdf")) return "pdf";
  return "other";
}

export function FilePreview({
  r2Key,
  label = "ดูไฟล์",
}: {
  r2Key: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const src = `/api/files?key=${encodeURIComponent(r2Key)}`;
  const kind = useMemo(() => guessKind(r2Key), [r2Key]);
  const name = r2Key.split("/").pop() ?? "ไฟล์";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline" className="gap-1.5">
          {kind === "image" ? <ImageIcon className="size-3.5" /> : <FileText className="size-3.5" />}
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent title={name} className="overflow-hidden p-0 md:w-[min(92vw,42rem)]">
        <button
          type="button"
          aria-label="ปิด"
          className="absolute right-3 top-3 z-10 rounded-full border border-[var(--glass-line)] bg-[color-mix(in_oklch,var(--surface-solid)_80%,transparent)] p-2 text-ink-muted shadow backdrop-blur-[10px]"
          onClick={() => setOpen(false)}
        >
          <X className="size-4" />
        </button>
        <p className="text-caption border-b border-line px-5 pb-3">แสดงในแอป</p>
        <div className="bg-ink/5">
          {kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={name} className="mx-auto max-h-[70vh] w-full object-contain" />
          ) : kind === "pdf" ? (
            <iframe title={name} src={src} className="h-[70vh] w-full border-0 bg-paper" />
          ) : (
            <div className="grid place-items-center gap-3 px-5 py-16">
              <FileText className="size-10 text-ink-muted" />
              <p className="text-caption">ดูตัวอย่างไม่ได้ในแอป</p>
              <Button asChild>
                <a href={src} target="_blank" rel="noreferrer">
                  เปิดไฟล์
                </a>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
