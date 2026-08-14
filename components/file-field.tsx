"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function FileField({
  name = "file",
  label = "ไฟล์",
  accept = "image/*,.pdf",
}: {
  name?: string;
  label?: string;
  accept?: string;
}) {
  const [fileName, setFileName] = useState("");
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type="file"
        accept={accept}
        onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
      />
      {fileName ? <p className="text-xs text-ink-muted">{fileName}</p> : null}
    </div>
  );
}
