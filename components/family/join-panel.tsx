"use client";

import { useRef } from "react";
import { JoinCamera } from "@/components/family/join-camera";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { joinFamily } from "@/app/(app)/family/actions";
import { cn } from "@/lib/utils";

export function JoinPanel({
  defaultCode = "",
  error,
  className,
}: {
  defaultCode?: string;
  error?: string;
  className?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form ref={formRef} action={joinFamily} className={cn("grid gap-3", className)}>
      <Label htmlFor="code">โค้ดครอบครัว</Label>
      <Input
        ref={inputRef}
        id="code"
        name="code"
        defaultValue={defaultCode}
        placeholder="PAN-XXXX"
        required
      />
      <JoinCamera
        onCode={(c) => {
          if (inputRef.current) inputRef.current.value = c;
          formRef.current?.requestSubmit();
        }}
      />
      {error ? <p className="text-sm text-orange">{error}</p> : null}
      <Button type="submit">เข้าร่วม</Button>
    </form>
  );
}
