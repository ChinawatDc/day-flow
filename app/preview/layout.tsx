import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_PREVIEW !== "1") {
    notFound();
  }
  return <AppShell title="พรีวิว">{children}</AppShell>;
}
