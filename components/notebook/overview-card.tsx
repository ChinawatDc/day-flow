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
      <p
        className={cn(
          "text-caption",
          tone === "surface" ? "text-ink-muted" : "text-surface/75",
        )}
      >
        {title}
      </p>
      <div
        className={cn(
          "mt-1.5 text-numeric text-[1.45rem] leading-none tracking-tight",
          tone === "surface" ? "text-ink" : "text-surface",
        )}
      >
        {value}
      </div>
    </>
  );

  const cls = cn(
    "df-press block px-4 py-3.5",
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
