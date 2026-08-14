export function safeNextPath(raw: string | null | undefined, fallback = "/today") {
  if (!raw) return fallback;
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("://")) return fallback;
  if (path.startsWith("/login")) return fallback;
  return path;
}
