import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });
config();

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Missing DATABASE_URL in .env.local");
  process.exit(1);
}

const sql = neon(url);
const raw = readFileSync(new URL("../drizzle/0000_init.sql", import.meta.url), "utf8");
const statements = raw
  .split(/;\s*\n/)
  .map((s) => s.trim())
  .filter((s) => s.length > 0 && !s.startsWith("--"));

for (const statement of statements) {
  await sql.query(statement);
  console.log("ok:", statement.slice(0, 60).replace(/\s+/g, " "));
}

console.log("schema applied");
