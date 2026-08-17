import { HuntShell } from "@/components/hunt/hunt-shell";
import { requireHuntFamily } from "@/lib/hunt/access";
import { ensureHuntSeeded } from "@/lib/hunt/data";

export const dynamic = "force-dynamic";

export default async function HuntLayout({ children }: { children: React.ReactNode }) {
  const m = await requireHuntFamily();
  await ensureHuntSeeded();
  return <HuntShell familyName={m.name}>{children}</HuntShell>;
}
