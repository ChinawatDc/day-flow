import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FilterPills({
  items,
}: {
  items: { href: string; label: string; active: boolean }[];
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {items.map((it) => (
        <Button key={it.href} asChild size="sm" variant={it.active ? "default" : "outline"}>
          <Link href={it.href}>{it.label}</Link>
        </Button>
      ))}
    </div>
  );
}
