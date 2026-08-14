import { cn } from "@/lib/utils";

export function NotebookForm({
  action,
  children,
  className,
}: {
  action?: (formData: FormData) => void | Promise<void>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <form
      action={action}
      className={cn(
        "mb-8 grid gap-3 rounded-[var(--radius-card)] border border-line bg-paper-2 p-[var(--space-card)] md:max-w-xl",
        className,
      )}
    >
      {children}
    </form>
  );
}
