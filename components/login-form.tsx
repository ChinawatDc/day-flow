"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export function LoginForm({
  googleEnabled,
  lineEnabled,
  nextPath = "/menu",
}: {
  googleEnabled: boolean;
  lineEnabled?: boolean;
  nextPath?: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError("");
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));
    const name = String(formData.get("name") ?? "ผู้ใช้");
    const result =
      mode === "login"
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({ email, password, name });
    setPending(false);
    if (result.error) {
      setError(result.error.message ?? "ไม่สำเร็จ");
      return;
    }
    router.push(nextPath);
    router.refresh();
  }

  return (
    <form action={onSubmit} className="grid gap-4">
      {mode === "register" ? (
        <div className="grid gap-1.5">
          <Label htmlFor="name">ชื่อ</Label>
          <Input id="name" name="name" required />
        </div>
      ) : null}
      <div className="grid gap-1.5">
        <Label htmlFor="email">อีเมล</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="password">รหัสผ่าน</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
      </div>
      {error ? <p className="text-sm text-orange">{error}</p> : null}
      <Button type="submit" size="lg" disabled={pending}>
        {mode === "login" ? "เข้าใช้" : "สมัคร"}
      </Button>
      <button
        type="button"
        className="text-left text-sm text-kaffir underline"
        onClick={() => setMode(mode === "login" ? "register" : "login")}
      >
        {mode === "login" ? "ยังไม่มีบัญชี — สมัคร" : "มีบัญชีแล้ว — เข้าใช้"}
      </button>
      {googleEnabled ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => authClient.signIn.social({ provider: "google", callbackURL: nextPath })}
        >
          เข้าด้วย Google
        </Button>
      ) : null}
      {lineEnabled ? (
        <Button asChild variant="outline">
          <a href={`/api/line/login?next=${encodeURIComponent(nextPath)}`}>เข้าด้วย LINE</a>
        </Button>
      ) : null}
    </form>
  );
}
