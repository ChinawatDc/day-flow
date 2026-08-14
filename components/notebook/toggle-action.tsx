import { Button } from "@/components/ui/button";

/** Compact server-action toggle used by tasks / shopping / bills. */
export function ToggleAction({
  action,
  id,
  name,
  value,
  label,
  variant = "outline",
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  name: string;
  value: string;
  label: string;
  variant?: "default" | "outline" | "orange";
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name={name} value={value} />
      <Button type="submit" size="sm" variant={variant}>
        {label}
      </Button>
    </form>
  );
}
