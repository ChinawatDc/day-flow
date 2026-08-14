import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/lib/env";

let r2Client: S3Client | null = null;

function getR2Client() {
  if (!env.r2Configured) return null;
  if (!r2Client) {
    r2Client = new S3Client({
      region: "auto",
      endpoint: `https://${env.r2AccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.r2AccessKeyId,
        secretAccessKey: env.r2SecretAccessKey,
      },
    });
  }
  return r2Client;
}

export async function uploadPrivateObject(
  key: string,
  body: Buffer,
  contentType: string,
) {
  const client = getR2Client();
  if (!client) throw new Error("ยังไม่ได้ตั้งค่า Cloudflare R2");
  await client.send(
    new PutObjectCommand({
      Bucket: env.r2BucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
  return key;
}

export async function deletePrivateObject(key: string) {
  const client = getR2Client();
  if (!client) return;
  await client.send(
    new DeleteObjectCommand({
      Bucket: env.r2BucketName,
      Key: key,
    }),
  );
}

export async function getPresignedGetUrl(key: string, expiresIn = 3600) {
  const client = getR2Client();
  if (!client) throw new Error("ยังไม่ได้ตั้งค่า Cloudflare R2");
  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: env.r2BucketName,
      Key: key,
    }),
    { expiresIn },
  );
}

export function objectKey(userId: string, module: string, filename: string) {
  return `${userId}/${module}/${Date.now()}-${filename}`;
}
