import Link from "next/link";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  hint,
  actionHref,
  actionLabel,
}: {
  title: string;
  hint: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-paper-2 px-4 py-10">
      <p className="text-title">{title}</p>
      <p className="text-caption mt-1">{hint}</p>
      {actionHref && actionLabel ? (
        <Button asChild className="mt-4">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
