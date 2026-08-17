import { getMembership } from "@/lib/family/data";
import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";

export async function requireHuntFamily() {
  const user = await requireUser();
  const m = await getMembership(user.id);
  if (!m) redirect("/family");
  return { user, ...m };
}
