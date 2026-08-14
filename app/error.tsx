"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const FLAG = "day-flow-chunk-reload";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const chunk = error.name === "ChunkLoadError" || /Loading chunk/.test(error.message ?? "");
    if (!chunk) return;
    try {
      if (sessionStorage.getItem(FLAG) === "1") return;
      sessionStorage.setItem(FLAG, "1");
      window.location.reload();
    } catch {
      /* ignore */
    }
  }, [error]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5">
      <p className="text-title">สมุดสะดุด</p>
      <p className="text-caption mt-2">ลองใหม่อีกครั้ง ถ้ายังไม่หายให้เปิดสุขภาพระบบ</p>
      {error.digest ? <p className="text-caption mt-1">{error.digest}</p> : null}
      <Button
        type="button"
        size="lg"
        className="mt-6 w-full"
        onClick={() => {
          try {
            sessionStorage.removeItem(FLAG);
          } catch {
            /* ignore */
          }
          reset();
        }}
      >
        ลองใหม่
      </Button>
      <Button asChild variant="outline" size="lg" className="mt-2 w-full">
        <a href="/api/health">เปิด /api/health</a>
      </Button>
    </div>
  );
}
