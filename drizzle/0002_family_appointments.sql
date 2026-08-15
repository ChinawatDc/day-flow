ALTER TABLE "family_shopping_items" ADD COLUMN IF NOT EXISTS "shop_on" date;

CREATE TABLE IF NOT EXISTS "family_appointments" (
  "id" text PRIMARY KEY,
  "family_id" text NOT NULL REFERENCES "families"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "starts_at" timestamp NOT NULL,
  "ends_at" timestamp,
  "place" text NOT NULL DEFAULT '',
  "assignee_id" text REFERENCES "user"("id") ON DELETE SET NULL,
  "created_by" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "created_at" timestamp NOT NULL DEFAULT now()
);
