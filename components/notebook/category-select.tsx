import { expenseCategories } from "@/lib/modules";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";

export function CategorySelect({
  id = "category",
  name = "category",
  label = "หมวด",
  defaultValue = "food",
}: {
  id?: string;
  name?: string;
  label?: string | null;
  defaultValue?: string;
}) {
  return (
    <>
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <NativeSelect id={id} name={name} defaultValue={defaultValue}>
        {expenseCategories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </NativeSelect>
    </>
  );
}
