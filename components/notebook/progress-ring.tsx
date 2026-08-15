export function ProgressRing({
  value,
  size = 72,
  stroke = 7,
  label,
  onDark = false,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  onDark?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className={onDark ? "text-surface/25" : "text-kaffir-soft"}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={
            onDark
              ? "text-surface transition-[stroke-dashoffset] duration-500"
              : "text-kaffir transition-[stroke-dashoffset] duration-500"
          }
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <p className={`text-numeric text-sm leading-none ${onDark ? "text-surface" : "text-ink"}`}>
          {pct}%
        </p>
        {label ? (
          <p className={`text-[10px] ${onDark ? "text-surface/70" : "text-ink-muted"}`}>{label}</p>
        ) : null}
      </div>
    </div>
  );
}
