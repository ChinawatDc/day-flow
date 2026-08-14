import { cn } from "@/lib/utils";

export function RecordRow({
  title,
  hint,
  value,
  actions,
  done,
}: {
  title: React.ReactNode;
  hint?: React.ReactNode;
  value?: React.ReactNode;
  actions?: React.ReactNode;
  done?: boolean;
}) {
  return (
    <li className="flex items-center gap-3 rounded-[var(--radius-card)] border border-line bg-paper px-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm font-medium", done && "text-ink-muted line-through")}>{title}</p>
        {hint ? <div className="text-caption truncate">{hint}</div> : null}
      </div>
      {value ? <div className="shrink-0">{value}</div> : null}
      {actions ? <div className="flex shrink-0 items-center gap-1">{actions}</div> : null}
    </li>
  );
}
