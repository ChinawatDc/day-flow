import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { isoToThaiDisplay } from "@/lib/thai-date";
import { bangkokTodayIso } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getSession();
  if (session?.user) redirect("/today");

  return (
    <div className="grid min-h-dvh md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <section className="flex flex-col justify-between bg-kaffir px-6 py-10 text-paper md:px-8">
        <p className="text-title text-3xl">day-flow</p>
        <div>
          <p className="text-display leading-tight">สมุดบ้าน<br />ไม่ใช่แดชบอร์ด</p>
          <p className="mt-4 text-paper/80">{isoToThaiDisplay(bangkokTodayIso())}</p>
        </div>
      </section>
      <section className="flex items-start px-5 py-10 md:px-16 md:py-16">
        <div className="w-full max-w-md">
          <h1 className="text-title text-3xl">เข้าสู่ระบบ</h1>
          <p className="mt-2 text-ink-muted">ใช้เมลกับรหัสผ่าน หรือ Google ถ้าตั้งค่าไว้</p>
          <div className="mt-8">
            <LoginForm googleEnabled={Boolean(process.env.GOOGLE_CLIENT_ID)} />
          </div>
        </div>
      </section>
    </div>
  );
}
