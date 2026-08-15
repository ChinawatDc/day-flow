export function ProgressRing({
  value,
  size = 72,
  stroke = 7,
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
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
          className="text-kaffir-soft"
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
          className="text-kaffir transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <p className="text-numeric text-sm leading-none text-ink">{pct}%</p>
        {label ? <p className="text-[10px] text-ink-muted">{label}</p> : null}
      </div>
    </div>
  );
}
