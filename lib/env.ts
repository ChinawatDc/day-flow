function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export const env = {
  get databaseUrl() {
    return required("DATABASE_URL");
  },
  get betterAuthSecret() {
    return required("BETTER_AUTH_SECRET");
  },
  get appUrl() {
    return (
      process.env.BETTER_AUTH_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
    );
  },
  get googleClientId() {
    return process.env.GOOGLE_CLIENT_ID || "";
  },
  get googleClientSecret() {
    return process.env.GOOGLE_CLIENT_SECRET || "";
  },
  get r2AccountId() {
    return process.env.R2_ACCOUNT_ID || "";
  },
  get r2AccessKeyId() {
    return process.env.R2_ACCESS_KEY_ID || "";
  },
  get r2SecretAccessKey() {
    return process.env.R2_SECRET_ACCESS_KEY || "";
  },
  get r2BucketName() {
    return process.env.R2_BUCKET_NAME || "";
  },
  get ablyApiKey() {
    return process.env.ABLY_API_KEY || "";
  },
  get ablyConfigured() {
    return Boolean(process.env.ABLY_API_KEY);
  },
  get r2Configured() {
    return Boolean(
      env.r2AccountId &&
        env.r2AccessKeyId &&
        env.r2SecretAccessKey &&
        env.r2BucketName,
    );
  },
  get lineLoginChannelId() {
    return process.env.LINE_LOGIN_CHANNEL_ID || "";
  },
  get lineLoginChannelSecret() {
    return process.env.LINE_LOGIN_CHANNEL_SECRET || "";
  },
  get lineLoginConfigured() {
    return Boolean(env.lineLoginChannelId && env.lineLoginChannelSecret);
  },
  get liffId() {
    return process.env.NEXT_PUBLIC_LIFF_ID || "";
  },
  get liffUrl() {
    return process.env.NEXT_PUBLIC_LIFF_URL || "";
  },
  get lineOaChannelId() {
    return process.env.LINE_OA_CHANNEL_ID || "";
  },
  get lineOaBotBasicId() {
    return process.env.LINE_OA_BOT_BASIC_ID || "";
  },
  get lineOaSecret() {
    return process.env.LINE_OA_CHANNEL_SECRET || "";
  },
  get lineOaToken() {
    return process.env.LINE_OA_CHANNEL_ACCESS_TOKEN || "";
  },
  get lineOaConfigured() {
    return Boolean(env.lineOaSecret && env.lineOaToken);
  },
};
