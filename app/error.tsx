"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5">
      <p className="text-title">สมุดสะดุด</p>
      <p className="text-caption mt-2">ลองใหม่อีกครั้ง ถ้ายังไม่หายให้เปิด /api/health</p>
      {error.digest ? <p className="text-caption mt-1">{error.digest}</p> : null}
      <button type="button" className="mt-6 text-left text-kaffir underline" onClick={reset}>
        ลองใหม่
      </button>
    </div>
  );
}
