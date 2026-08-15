import { cn } from "@/lib/utils";

export function StatCard({
  tip,
  value,
  icon,
  className,
}: {
  tip: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-line bg-paper-2 px-3 py-3", className)}>
      {icon ? <div className="mb-1 text-kaffir">{icon}</div> : null}
      <p className="text-display text-[1.6rem] leading-none">{value}</p>
      <p className="text-caption mt-1">{tip}</p>
    </div>
  );
}
