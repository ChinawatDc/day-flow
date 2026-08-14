import Link from "next/link";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  hint,
  actionHref,
  actionLabel,
  children,
}: {
  title: string;
  hint: string;
  actionHref?: string;
  actionLabel?: string;
  children?: React.ReactNode;
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
      {children ? <div className="mt-4 flex flex-wrap gap-2">{children}</div> : null}
    </div>
  );
}
