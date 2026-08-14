"use client";

import { useActionState, useRef, useState } from "react";
import { JoinCamera } from "@/components/family/join-camera";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { joinFamily } from "@/app/(app)/family/actions";

export function JoinPanel({ defaultCode = "" }: { defaultCode?: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [code, setCode] = useState(defaultCode);
  const [err, action] = useActionState(async (_prev: string, fd: FormData) => {
    return (await joinFamily(fd)) ?? "";
  }, "");

  return (
    <form ref={formRef} action={action} className="grid gap-3">
      <Label htmlFor="code">โค้ดครอบครัว</Label>
      <Input
        id="code"
        name="code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="PAN-XXXX"
        required
      />
      <JoinCamera
        onCode={(c) => {
          setCode(c);
          queueMicrotask(() => formRef.current?.requestSubmit());
        }}
      />
      {err ? <p className="text-sm text-orange">{err}</p> : null}
      <Button type="submit">เข้าร่วม</Button>
    </form>
  );
}
