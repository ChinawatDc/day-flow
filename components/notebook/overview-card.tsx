import Link from "next/link";
import { cn } from "@/lib/utils";

export function OverviewCard({
  href,
  title,
  value,
  tone = "surface",
  className,
}: {
  href?: string;
  title: string;
  value: React.ReactNode;
  tone?: "surface" | "kaffir" | "orange";
  className?: string;
}) {
  const body = (
    <>
      <p className={cn("text-sm", tone === "surface" ? "text-ink-muted" : "text-surface/75")}>{title}</p>
      <div className={cn("mt-2 text-display text-[1.75rem] leading-none", tone === "surface" ? "text-ink" : "text-surface")}>
        {value}
      </div>
    </>
  );

  const cls = cn(
    "df-press block p-4",
    tone === "surface" && "df-card",
    tone === "kaffir" && "df-card-hero",
    tone === "orange" && "rounded-[var(--radius-lg)] bg-orange text-surface shadow-[var(--shadow-md)]",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={cls}>
        {body}
      </Link>
    );
  }
  return <div className={cls}>{body}</div>;
}
