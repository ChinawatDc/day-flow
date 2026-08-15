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
    <div className="df-canvas grid min-h-dvh md:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
      <section className="df-card-hero relative flex min-h-[42vh] flex-col justify-between rounded-none px-7 py-10 text-surface md:min-h-dvh md:rounded-none md:px-10 md:py-12">
        <p className="relative z-[1] text-sm font-medium tracking-wide text-surface/70">
          {isoToThaiDisplay(bangkokTodayIso())}
        </p>
        <p className="relative z-[1] text-display text-[3rem] leading-none tracking-tight text-surface md:text-[3.5rem]">
          day-flow
        </p>
      </section>
      <section className="flex items-center px-5 py-10 md:px-16 md:py-16">
        <div className="df-card df-enter w-full max-w-md p-6 md:p-8">
          <h1 className="text-title text-[1.75rem]">เข้าสู่ระบบ</h1>
          <div className="mt-7">
            <LoginForm googleEnabled={Boolean(process.env.GOOGLE_CLIENT_ID)} nextPath={dest} />
          </div>
        </div>
      </section>
    </div>
  );
}
