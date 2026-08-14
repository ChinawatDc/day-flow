"use client";

export function FileLink({ r2Key, label = "เปิดไฟล์" }: { r2Key: string; label?: string }) {
  return (
    <a
      href={`/api/files?key=${encodeURIComponent(r2Key)}`}
      target="_blank"
      rel="noreferrer"
      className="text-sm text-kaffir underline"
    >
      {label}
    </a>
  );
}
