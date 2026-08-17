import Link from "next/link";
import { BUDGET_CHIPS } from "@/lib/hunt/format";
import { cn } from "@/lib/utils";

export function HuntFilters({
  budget,
  detached,
  base = "/family/hunt",
}: {
  budget: string;
  detached: boolean;
  base?: string;
}) {
  function href(nextBudget: string, nextDetached = detached) {
    const sp = new URLSearchParams();
    if (nextBudget && nextBudget !== "all") sp.set("budget", nextBudget);
    if (nextDetached) sp.set("detached", "1");
    const q = sp.toString();
    return q ? `${base}?${q}` : base;
  }

  return (
    <div className="mb-5 grid gap-3">
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {BUDGET_CHIPS.map((c) => (
          <Link key={c.id} href={href(c.id)} className={cn("hh-chip", budget === c.id && "hh-chip-on")}>
            {c.label}
          </Link>
        ))}
      </div>
      <Link href={href(budget, !detached)} className={cn("hh-chip w-fit", detached && "hh-chip-on")}>
        บ้านเดี่ยวเท่านั้น
      </Link>
    </div>
  );
}
