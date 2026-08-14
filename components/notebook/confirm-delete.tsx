"use client";

import { Button } from "@/components/ui/button";

export function ConfirmDelete({
  action,
  id,
  name = "id",
  label = "ลบ",
  message = "ลบรายการนี้?",
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  name?: string;
  label?: string;
  message?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      <input type="hidden" name={name} value={id} />
      <Button type="submit" size="sm" variant="ghost">
        {label}
      </Button>
    </form>
  );
}
