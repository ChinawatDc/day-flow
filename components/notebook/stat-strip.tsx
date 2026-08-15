import Link from "next/link";
import { cn } from "@/lib/utils";

/** Dense metrics strip — one surface, not a grid of hero-metric cards. */
export function StatStrip({
  items,
  className,
}: {
  items: {
    label: string;
    value: React.ReactNode;
    href?: string;
    emphasize?: boolean;
  }[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "df-card mb-5 grid overflow-hidden",
        items.length === 2 && "grid-cols-2",
        items.length === 3 && "grid-cols-3",
        items.length > 3 && "grid-cols-2 sm:grid-cols-4",
        className,
      )}
    >
      {items.map((it, i) => {
        const body = (
          <>
            <p className={cn("text-[0.8125rem] font-medium", it.emphasize ? "text-surface/75" : "text-ink-muted")}>
              {it.label}
            </p>
            <div
              className={cn(
                "mt-1.5 text-numeric text-[1.35rem] leading-none tracking-tight",
                it.emphasize ? "text-surface" : "text-ink",
              )}
            >
              {it.value}
            </div>
          </>
        );
        const cell = cn(
          "df-press block px-4 py-3.5",
          i > 0 && "border-l border-[var(--stroke)]",
          it.emphasize &&
            "bg-[linear-gradient(160deg,color-mix(in_oklch,var(--brand)_85%,white),var(--brand-strong))] text-surface",
        );
        if (it.href) {
          return (
            <Link key={it.label} href={it.href} className={cell}>
              {body}
            </Link>
          );
        }
        return (
          <div key={it.label} className={cell}>
            {body}
          </div>
        );
      })}
    </div>
  );
}
