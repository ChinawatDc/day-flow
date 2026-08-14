import { neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import { env } from "@/lib/env";
import * as schema from "./schema";

neonConfig.webSocketConstructor = ws;

type AppDb = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = globalThis as unknown as {
  dayFlowPool?: Pool;
  dayFlowDb?: AppDb;
};

function createPool() {
  return new Pool({
    connectionString: env.databaseUrl,
    max: 1,
  });
}

export function getDb() {
  if (!globalForDb.dayFlowPool) {
    globalForDb.dayFlowPool = createPool();
  }
  if (!globalForDb.dayFlowDb) {
    globalForDb.dayFlowDb = drizzle(globalForDb.dayFlowPool, { schema });
  }
  return globalForDb.dayFlowDb;
}

export type Db = ReturnType<typeof getDb>;
