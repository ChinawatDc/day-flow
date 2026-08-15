import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { safeNextPath } from "@/lib/safe-path";
import { isoToThaiDisplay } from "@/lib/thai-date";
import { bangkokTodayIso } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();
  const { next } = await searchParams;
  const dest = safeNextPath(next);
  if (session?.user) redirect(dest);

  return (
    <div className="df-canvas grid min-h-dvh md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <section className="df-card-hero flex flex-col justify-between rounded-none px-6 py-10 md:rounded-none md:px-8">
        <p className="text-title text-3xl text-surface">day-flow</p>
        <div>
          <p className="text-display leading-tight text-surface">
            สมุดบ้าน
            <br />
            ไม่ใช่แดชบอร์ด
          </p>
          <p className="mt-4 text-surface/80">{isoToThaiDisplay(bangkokTodayIso())}</p>
        </div>
      </section>
      <section className="flex items-start px-5 py-10 md:px-16 md:py-16">
        <div className="df-card df-enter w-full max-w-md p-6 md:p-8">
          <h1 className="text-title text-3xl">เข้าสู่ระบบ</h1>
          <p className="mt-2 text-ink-muted">ใช้เมลกับรหัสผ่าน หรือ Google ถ้าตั้งค่าไว้</p>
          <div className="mt-8">
            <LoginForm googleEnabled={Boolean(process.env.GOOGLE_CLIENT_ID)} nextPath={dest} />
          </div>
        </div>
      </section>
    </div>
  );
}
