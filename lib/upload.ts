import { env } from "@/lib/env";
import { familyObjectKey, objectKey, uploadPrivateObject } from "@/lib/r2/client";

function safeName(file: File) {
  return file.name.replace(/[^\w.\-ก-๙]+/g, "_") || "file";
}

export async function maybeUpload(
  userId: string,
  module: string,
  file: File | null | undefined,
) {
  if (!file || file.size === 0) return null;
  if (!env.r2Configured) return null;
  try {
    const key = objectKey(userId, module, safeName(file));
    const buf = Buffer.from(await file.arrayBuffer());
    await uploadPrivateObject(key, buf, file.type || "application/octet-stream");
    return key;
  } catch (err) {
    console.error("upload failed", err);
    return null;
  }
}

export async function maybeUploadFamily(
  familyId: string,
  module: string,
  file: File | null | undefined,
) {
  if (!file || file.size === 0) return null;
  if (!env.r2Configured) return null;
  try {
    const key = familyObjectKey(familyId, module, safeName(file));
    const buf = Buffer.from(await file.arrayBuffer());
    await uploadPrivateObject(key, buf, file.type || "application/octet-stream");
    return key;
  } catch (err) {
    console.error("family upload failed", err);
    return null;
  }
}
