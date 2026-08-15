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
    <div className="df-card border-dashed px-5 py-12 text-center">
      <p className="text-title">{title}</p>
      <p className="text-caption mx-auto mt-2 max-w-xs">{hint}</p>
      {actionHref && actionLabel ? (
        <Button asChild className="mt-5">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
      {children ? <div className="mt-5 flex flex-wrap justify-center gap-2">{children}</div> : null}
    </div>
  );
}
