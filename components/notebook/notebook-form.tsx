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
    <form action={action} className={cn("grid gap-3", className)}>
      {children}
    </form>
  );
}
