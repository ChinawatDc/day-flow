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
      <p className="font-display text-xl">{title}</p>
      <p className="mt-1 text-sm text-ink-muted">{hint}</p>
      {actionHref && actionLabel ? (
        <Button asChild className="mt-4">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
