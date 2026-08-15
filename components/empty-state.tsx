import Link from "next/link";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  actionHref,
  actionLabel,
  children,
}: {
  title: string;
  actionHref?: string;
  actionLabel?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--stroke-strong)] bg-[color-mix(in_oklch,var(--surface-2)_70%,transparent)] px-5 py-14 text-center">
      <p className="text-title text-ink-muted">{title}</p>
      {actionHref && actionLabel ? (
        <Button asChild className="mt-5">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
      {children ? <div className="mt-5 flex flex-wrap justify-center gap-2">{children}</div> : null}
    </div>
  );
}
