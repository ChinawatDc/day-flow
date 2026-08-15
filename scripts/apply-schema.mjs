import { config } from "dotenv";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });
config();

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Missing DATABASE_URL in .env.local");
  process.exit(1);
}

const sql = neon(url);
const dir = new URL("../drizzle/", import.meta.url);
const files = readdirSync(dir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

for (const file of files) {
  const raw = readFileSync(join(dir.pathname, file), "utf8");
  const statements = raw
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  console.log(`--- ${file} ---`);
  for (const statement of statements) {
    await sql.query(statement);
    console.log("ok:", statement.slice(0, 60).replace(/\s+/g, " "));
  }
}

console.log("schema applied");
