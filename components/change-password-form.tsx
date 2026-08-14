"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export function ChangePasswordForm() {
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError("");
    setOk("");
    const currentPassword = String(formData.get("currentPassword"));
    const newPassword = String(formData.get("newPassword"));
    const result = await authClient.changePassword({ currentPassword, newPassword });
    setPending(false);
    if (result.error) {
      setError(result.error.message ?? "ไม่สำเร็จ");
      return;
    }
    setOk("เปลี่ยนรหัสแล้ว");
  }

  return (
    <form action={onSubmit} className="grid gap-3">
      <div className="grid gap-1.5">
        <Label htmlFor="currentPassword">รหัสปัจจุบัน</Label>
        <Input id="currentPassword" name="currentPassword" type="password" required minLength={8} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="newPassword">รหัสใหม่</Label>
        <Input id="newPassword" name="newPassword" type="password" required minLength={8} />
      </div>
      {error ? <p className="text-sm text-orange">{error}</p> : null}
      {ok ? <p className="text-sm text-kaffir">{ok}</p> : null}
      <Button type="submit" disabled={pending}>
        เปลี่ยนรหัส
      </Button>
    </form>
  );
}
