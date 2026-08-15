import { cn } from "@/lib/utils";

export function RecordRow({
  title,
  hint,
  value,
  actions,
  done,
  leading,
  tag,
  flush,
}: {
  title: React.ReactNode;
  hint?: React.ReactNode;
  value?: React.ReactNode;
  actions?: React.ReactNode;
  done?: boolean;
  leading?: React.ReactNode;
  tag?: React.ReactNode;
  flush?: boolean;
}) {
  return (
    <li
      className={cn(
        "flex items-center gap-3",
        flush
          ? "border-b border-[var(--stroke)] px-4 py-3.5 last:border-b-0"
          : "df-card px-3.5 py-3.5",
        done && "opacity-65",
      )}
    >
      {leading ? <div className="shrink-0">{leading}</div> : null}
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-[0.95rem] font-semibold", done && "text-ink-muted line-through")}>
          {title}
        </p>
        {hint ? <div className="text-caption mt-0.5 truncate">{hint}</div> : null}
        {tag ? <div className="mt-1.5 flex flex-wrap gap-1.5">{tag}</div> : null}
      </div>
      {value ? <div className="shrink-0 text-numeric">{value}</div> : null}
      {actions ? <div className="flex shrink-0 items-center gap-1">{actions}</div> : null}
    </li>
  );
}

export function SoftTag({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "kaffir" | "orange";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-sm)] px-2 py-0.5 text-[11px] font-medium",
        tone === "muted" && "bg-paper-2 text-ink-muted",
        tone === "kaffir" && "bg-kaffir-soft text-kaffir-dark",
        tone === "orange" && "bg-orange-soft text-orange",
      )}
    >
      {children}
    </span>
  );
}

/** One paper surface with divided rows — prefer over a stack of cards. */
export function RecordList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <ul className={cn("df-card df-stagger overflow-hidden p-0", className)}>{children}</ul>;
}
