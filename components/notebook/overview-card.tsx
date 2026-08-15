import Link from "next/link";
import { cn } from "@/lib/utils";

export function OverviewCard({
  href,
  title,
  value,
  hint,
  tone = "surface",
  className,
}: {
  href?: string;
  title: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: "surface" | "kaffir" | "orange";
  className?: string;
}) {
  const body = (
    <>
      <p className={cn("text-sm", tone === "kaffir" || tone === "orange" ? "text-paper/75" : "text-ink-muted")}>
        {title}
      </p>
      <div
        className={cn(
          "mt-2 text-display text-[1.75rem] leading-none",
          tone === "kaffir" || tone === "orange" ? "text-paper" : "text-ink",
        )}
      >
        {value}
      </div>
      {hint ? (
        <p className={cn("mt-2 text-sm", tone === "kaffir" || tone === "orange" ? "text-paper/80" : "text-caption")}>
          {hint}
        </p>
      ) : null}
    </>
  );

  const cls = cn(
    "block rounded-[1.35rem] p-4 shadow-[var(--shadow-card)] transition-transform duration-150 active:scale-[0.99]",
    tone === "surface" && "border border-line/80 bg-surface",
    tone === "kaffir" && "bg-kaffir",
    tone === "orange" && "bg-orange",
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
