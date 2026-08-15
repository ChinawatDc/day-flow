ALTER TABLE "families" ADD COLUMN IF NOT EXISTS "join_code_expires_at" timestamp;

ALTER TABLE "family_messages" ADD COLUMN IF NOT EXISTS "image_r2_key" text;
ALTER TABLE "family_messages" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;

CREATE TABLE IF NOT EXISTS "family_channel_reads" (
  "id" text PRIMARY KEY,
  "family_id" text NOT NULL REFERENCES "families"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "channel" text NOT NULL,
  "last_read_at" timestamp NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "family_channel_read_pair" ON "family_channel_reads" ("family_id", "user_id", "channel");

CREATE TABLE IF NOT EXISTS "family_shopping_items" (
  "id" text PRIMARY KEY,
  "family_id" text NOT NULL REFERENCES "families"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "bought" boolean NOT NULL DEFAULT false,
  "assignee_id" text REFERENCES "user"("id") ON DELETE SET NULL,
  "created_by" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "family_chores" (
  "id" text PRIMARY KEY,
  "family_id" text NOT NULL REFERENCES "families"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "due_on" date,
  "done" boolean NOT NULL DEFAULT false,
  "assignee_id" text REFERENCES "user"("id") ON DELETE SET NULL,
  "created_by" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);
