import { cn } from "@/lib/utils";

/** Card list item with optional badge + bottom action row. */
export function ItemCard({
  title,
  hint,
  badge,
  value,
  actions,
  muted,
  warn,
  className,
}: {
  title: React.ReactNode;
  hint?: React.ReactNode;
  badge?: React.ReactNode;
  value?: React.ReactNode;
  actions?: React.ReactNode;
  muted?: boolean;
  warn?: boolean;
  className?: string;
}) {
  return (
    <li
      className={cn(
        "df-card p-3.5",
        muted && "opacity-70",
        warn && !muted && "border-orange/30 bg-orange-soft/15",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={cn("truncate text-base font-semibold", muted && "text-ink-muted line-through")}>{title}</p>
          {hint ? <div className="text-caption mt-0.5">{hint}</div> : null}
        </div>
        {badge ? (
          <span className="shrink-0 rounded-full bg-kaffir-soft px-2.5 py-1 text-xs font-semibold text-kaffir">
            {badge}
          </span>
        ) : null}
        {value ? <div className="shrink-0">{value}</div> : null}
      </div>
      {actions ? <div className="mt-3 flex flex-wrap items-center gap-1.5">{actions}</div> : null}
    </li>
  );
}
