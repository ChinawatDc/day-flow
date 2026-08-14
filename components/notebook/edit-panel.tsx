export function EditPanel({ children, label = "แก้" }: { children: React.ReactNode; label?: string }) {
  return (
    <details className="rounded-lg bg-paper-2 px-3 py-2">
      <summary className="cursor-pointer text-sm text-kaffir">{label}</summary>
      <div className="mt-3 grid gap-3">{children}</div>
    </details>
  );
}
