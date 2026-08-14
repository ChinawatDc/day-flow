import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@/lib/env";
import * as schema from "./schema";

type AppDb = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = globalThis as unknown as {
  dayFlowDb?: AppDb;
};

export function getDb() {
  if (!globalForDb.dayFlowDb) {
    const sql = neon(env.databaseUrl);
    globalForDb.dayFlowDb = drizzle(sql, { schema });
  }
  return globalForDb.dayFlowDb;
}

export type Db = ReturnType<typeof getDb>;
