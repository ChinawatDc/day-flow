import { cn } from "@/lib/utils";

export function SectionCard({
  icon,
  title,
  children,
  danger,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  children: React.ReactNode;
  danger?: boolean;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "df-card p-4",
        danger && "border-orange/35 bg-orange-soft/20",
        className,
      )}
    >
      <div className="mb-4 flex items-start gap-3">
        {icon ? (
          <div
            className={cn(
              "mt-0.5 rounded-[var(--radius-sm)] p-2",
              danger ? "bg-orange/15 text-orange" : "bg-kaffir-soft text-kaffir",
            )}
          >
            {icon}
          </div>
        ) : null}
        <div>
          <h2 className="text-title text-base">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}
