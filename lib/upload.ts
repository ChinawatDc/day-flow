import { env } from "@/lib/env";
import { objectKey, uploadPrivateObject } from "@/lib/r2/client";

export async function maybeUpload(
  userId: string,
  module: string,
  file: File | null | undefined,
) {
  if (!file || file.size === 0) return null;
  if (!env.r2Configured) return null;
  const safe = file.name.replace(/[^\w.\-ก-๙]+/g, "_");
  const key = objectKey(userId, module, safe || "file");
  const buf = Buffer.from(await file.arrayBuffer());
  await uploadPrivateObject(key, buf, file.type || "application/octet-stream");
  return key;
}
