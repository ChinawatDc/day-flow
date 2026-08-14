import { cn, bahtFromSatang } from "@/lib/utils";

export function AmountText({
  satang,
  className,
}: {
  satang: number;
  className?: string;
}) {
  return <span className={cn("text-numeric", className)}>฿{bahtFromSatang(satang)}</span>;
}
