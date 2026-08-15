import { cn } from "@/lib/utils";

export function RecordRow({
  title,
  hint,
  value,
  actions,
  done,
  leading,
  tag,
}: {
  title: React.ReactNode;
  hint?: React.ReactNode;
  value?: React.ReactNode;
  actions?: React.ReactNode;
  done?: boolean;
  leading?: React.ReactNode;
  tag?: React.ReactNode;
}) {
  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-[var(--radius-card)] border border-line/70 bg-surface px-3.5 py-3.5 shadow-[var(--shadow-card)]",
        done && "opacity-70",
      )}
    >
      {leading ? <div className="shrink-0">{leading}</div> : null}
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-[0.95rem] font-semibold", done && "text-ink-muted line-through")}>{title}</p>
        {hint ? <div className="text-caption mt-0.5 truncate">{hint}</div> : null}
        {tag ? <div className="mt-2 flex flex-wrap gap-1.5">{tag}</div> : null}
      </div>
      {value ? <div className="shrink-0">{value}</div> : null}
      {actions ? <div className="flex shrink-0 items-center gap-1">{actions}</div> : null}
    </li>
  );
}

export function SoftTag({ children, tone = "muted" }: { children: React.ReactNode; tone?: "muted" | "kaffir" | "orange" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium",
        tone === "muted" && "bg-paper-2 text-ink-muted",
        tone === "kaffir" && "bg-kaffir-soft text-kaffir-dark",
        tone === "orange" && "bg-orange-soft text-orange",
      )}
    >
      {children}
    </span>
  );
}
