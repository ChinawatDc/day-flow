CREATE TABLE IF NOT EXISTS "hunt_loan_docs" (
  "id" text PRIMARY KEY,
  "family_id" text NOT NULL REFERENCES "families"("id") ON DELETE CASCADE,
  "doc_key" text NOT NULL,
  "category" text NOT NULL,
  "target" text NOT NULL,
  "title" text NOT NULL,
  "description" text NOT NULL DEFAULT '',
  "status" text NOT NULL DEFAULT 'pending',
  "note" text NOT NULL DEFAULT '',
  "file_url" text,
  "sort_order" integer NOT NULL DEFAULT 0,
  "updated_by" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "hunt_loan_doc_family_target_key" ON "hunt_loan_docs" ("family_id", "target", "doc_key");

CREATE TABLE IF NOT EXISTS "hunt_bank_apps" (
  "id" text PRIMARY KEY,
  "family_id" text NOT NULL REFERENCES "families"("id") ON DELETE CASCADE,
  "bank_code" text NOT NULL,
  "bank_name" text NOT NULL,
  "color" text NOT NULL DEFAULT '#4b5563',
  "status" text NOT NULL DEFAULT 'preparing',
  "submitted_at" date,
  "approved_amount_satang" integer,
  "interest_rate_percent" text NOT NULL DEFAULT '',
  "monthly_payment_satang" integer,
  "contact_person" text NOT NULL DEFAULT '',
  "contact_phone" text NOT NULL DEFAULT '',
  "note" text NOT NULL DEFAULT '',
  "updated_by" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "hunt_bank_app_family_bank" ON "hunt_bank_apps" ("family_id", "bank_code");
