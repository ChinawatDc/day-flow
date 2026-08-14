import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AppGroupLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return children;
}
