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
    <li className="rounded-[var(--radius-card)] border border-line bg-paper p-[var(--space-card)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={cn("text-title", done && "text-ink-muted line-through")}>{title}</p>
          {hint ? <div className="text-caption mt-1">{hint}</div> : null}
        </div>
        {value ? <div className="shrink-0">{value}</div> : null}
      </div>
      {actions ? <div className="mt-3 flex flex-wrap gap-2">{actions}</div> : null}
    </li>
  );
}
