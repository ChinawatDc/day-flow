import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const getSession = cache(async () => {
  if (!process.env.DATABASE_URL || !process.env.BETTER_AUTH_SECRET) {
    return null;
  }
  try {
    return await auth.api.getSession({ headers: await headers() });
  } catch {
    return null;
  }
});

export const requireUser = cache(async () => {
  const session = await getSession();
  if (!session?.user) {
    const h = await headers();
    const pathname = h.get("x-pathname") ?? "";
    const search = h.get("x-search") ?? "";
    const next = pathname.startsWith("/") ? `${pathname}${search}` : "/today";
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }
  return session.user;
});
