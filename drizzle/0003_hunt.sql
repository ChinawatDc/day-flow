ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "line_user_id" text;
CREATE UNIQUE INDEX IF NOT EXISTS "user_line_user_id_unique" ON "user" ("line_user_id");

CREATE TABLE IF NOT EXISTS "hunt_projects" (
  "id" text PRIMARY KEY,
  "name" text NOT NULL,
  "developer" text NOT NULL,
  "zone" text NOT NULL,
  "house_type" text NOT NULL DEFAULT 'detached',
  "has_detached" boolean NOT NULL DEFAULT true,
  "has_twin" boolean NOT NULL DEFAULT false,
  "price_start_satang" integer NOT NULL,
  "price_note" text NOT NULL DEFAULT '',
  "land_note" text NOT NULL DEFAULT '',
  "land_wah_tenths" integer,
  "usable_sqm_min" integer,
  "usable_sqm_max" integer,
  "bedrooms" integer,
  "bathrooms" integer,
  "parking" integer,
  "fit_score" integer NOT NULL,
  "value_score" integer NOT NULL,
  "rank" integer NOT NULL,
  "commute_note" text NOT NULL DEFAULT '',
  "size_note" text NOT NULL DEFAULT '',
  "caveat" text NOT NULL DEFAULT '',
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "hunt_price_notes" (
  "id" text PRIMARY KEY,
  "project_id" text NOT NULL REFERENCES "hunt_projects"("id") ON DELETE CASCADE,
  "source" text NOT NULL,
  "price_satang" integer,
  "note" text NOT NULL DEFAULT '',
  "as_of" date NOT NULL
);

CREATE TABLE IF NOT EXISTS "hunt_family_picks" (
  "id" text PRIMARY KEY,
  "family_id" text NOT NULL REFERENCES "families"("id") ON DELETE CASCADE,
  "project_id" text NOT NULL REFERENCES "hunt_projects"("id") ON DELETE CASCADE,
  "shortlisted" boolean NOT NULL DEFAULT false,
  "note" text NOT NULL DEFAULT '',
  "updated_by" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "updated_at" timestamp NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "hunt_pick_family_project" ON "hunt_family_picks" ("family_id", "project_id");

CREATE TABLE IF NOT EXISTS "hunt_votes" (
  "id" text PRIMARY KEY,
  "family_id" text NOT NULL REFERENCES "families"("id") ON DELETE CASCADE,
  "project_id" text NOT NULL REFERENCES "hunt_projects"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "score" integer NOT NULL,
  "updated_at" timestamp NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "hunt_vote_member" ON "hunt_votes" ("family_id", "project_id", "user_id");

CREATE TABLE IF NOT EXISTS "hunt_compare_sets" (
  "id" text PRIMARY KEY,
  "family_id" text NOT NULL UNIQUE REFERENCES "families"("id") ON DELETE CASCADE,
  "project_ids" text NOT NULL DEFAULT '',
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "hunt_visits" (
  "id" text PRIMARY KEY,
  "family_id" text NOT NULL REFERENCES "families"("id") ON DELETE CASCADE,
  "project_id" text NOT NULL REFERENCES "hunt_projects"("id") ON DELETE CASCADE,
  "visited_on" date NOT NULL,
  "starts_at" timestamp,
  "place" text NOT NULL DEFAULT '',
  "summary" text NOT NULL DEFAULT '',
  "appointment_id" text REFERENCES "family_appointments"("id") ON DELETE SET NULL,
  "created_by" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "hunt_visit_photos" (
  "id" text PRIMARY KEY,
  "visit_id" text NOT NULL REFERENCES "hunt_visits"("id") ON DELETE CASCADE,
  "r2_key" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now()
);
