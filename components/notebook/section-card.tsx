import { cn } from "@/lib/utils";

export function SectionCard({
  icon,
  title,
  hint,
  children,
  danger,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  hint?: string;
  children: React.ReactNode;
  danger?: boolean;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border p-4",
        danger ? "border-orange/35 bg-orange-soft/15" : "border-line bg-paper",
        className,
      )}
    >
      <div className="mb-4 flex items-start gap-3">
        {icon ? (
          <div
            className={cn(
              "mt-0.5 rounded-xl p-2",
              danger ? "bg-orange/15 text-orange" : "bg-paper-2 text-kaffir",
            )}
          >
            {icon}
          </div>
        ) : null}
        <div>
          <h2 className="text-title text-base">{title}</h2>
          {hint ? <p className="text-caption">{hint}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}
