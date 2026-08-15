CREATE TABLE IF NOT EXISTS "user" (
  "id" text PRIMARY KEY,
  "name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "email_verified" boolean NOT NULL DEFAULT false,
  "image" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "session" (
  "id" text PRIMARY KEY,
  "expires_at" timestamp NOT NULL,
  "token" text NOT NULL UNIQUE,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  "ip_address" text,
  "user_agent" text,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
  "id" text PRIMARY KEY,
  "account_id" text NOT NULL,
  "provider_id" text NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "access_token" text,
  "refresh_token" text,
  "id_token" text,
  "access_token_expires_at" timestamp,
  "refresh_token_expires_at" timestamp,
  "scope" text,
  "password" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "verification" (
  "id" text PRIMARY KEY,
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expires_at" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "captures" (
  "id" text PRIMARY KEY,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "note" text NOT NULL DEFAULT '',
  "kind" text NOT NULL DEFAULT 'unfiled',
  "r2_key" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "tasks" (
  "id" text PRIMARY KEY,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "note" text NOT NULL DEFAULT '',
  "due_on" date,
  "done_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "expenses" (
  "id" text PRIMARY KEY,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "amount_satang" integer NOT NULL,
  "category" text NOT NULL DEFAULT 'other',
  "merchant" text NOT NULL DEFAULT '',
  "spent_on" date NOT NULL,
  "receipt_r2_key" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "vault_items" (
  "id" text PRIMARY KEY,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "kind" text NOT NULL DEFAULT 'other',
  "expires_on" date,
  "r2_key" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "home_items" (
  "id" text PRIMARY KEY,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "location" text NOT NULL DEFAULT '',
  "quantity" integer NOT NULL DEFAULT 1,
  "r2_key" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "shopping_items" (
  "id" text PRIMARY KEY,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "bought" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "home_bills" (
  "id" text PRIMARY KEY,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "amount_satang" integer NOT NULL DEFAULT 0,
  "due_on" date,
  "paid" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "journal_entries" (
  "id" text PRIMARY KEY,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "entry_on" date NOT NULL,
  "body" text NOT NULL DEFAULT '',
  "mood" text NOT NULL DEFAULT 'ok',
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "journal_user_day" ON "journal_entries" ("user_id", "entry_on");

CREATE TABLE IF NOT EXISTS "journal_photos" (
  "id" text PRIMARY KEY,
  "entry_id" text NOT NULL REFERENCES "journal_entries"("id") ON DELETE CASCADE,
  "r2_key" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "families" (
  "id" text PRIMARY KEY,
  "name" text NOT NULL,
  "join_code" text NOT NULL UNIQUE,
  "join_code_expires_at" timestamp,
  "created_by" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "family_members" (
  "id" text PRIMARY KEY,
  "family_id" text NOT NULL REFERENCES "families"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "role" text NOT NULL DEFAULT 'member',
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "family_member_pair" ON "family_members" ("family_id", "user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "family_member_user" ON "family_members" ("user_id");

CREATE TABLE IF NOT EXISTS "family_messages" (
  "id" text PRIMARY KEY,
  "family_id" text NOT NULL REFERENCES "families"("id") ON DELETE CASCADE,
  "channel" text NOT NULL,
  "sender_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "body" text NOT NULL,
  "image_r2_key" text,
  "deleted_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "family_channel_reads" (
  "id" text PRIMARY KEY,
  "family_id" text NOT NULL REFERENCES "families"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "channel" text NOT NULL,
  "last_read_at" timestamp NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "family_channel_read_pair" ON "family_channel_reads" ("family_id", "user_id", "channel");

CREATE TABLE IF NOT EXISTS "family_location_shares" (
  "id" text PRIMARY KEY,
  "family_id" text NOT NULL REFERENCES "families"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "expires_at" timestamp NOT NULL,
  "lat" text NOT NULL DEFAULT '',
  "lng" text NOT NULL DEFAULT '',
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "family_location_user" ON "family_location_shares" ("family_id", "user_id");

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

