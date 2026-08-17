import {
  boolean,
  date,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  lineUserId: text("line_user_id").unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const captures = pgTable("captures", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  note: text("note").notNull().default(""),
  kind: text("kind").notNull().default("unfiled"),
  r2Key: text("r2_key"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  note: text("note").notNull().default(""),
  dueOn: date("due_on"),
  doneAt: timestamp("done_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const expenses = pgTable("expenses", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  amountSatang: integer("amount_satang").notNull(),
  category: text("category").notNull().default("other"),
  merchant: text("merchant").notNull().default(""),
  spentOn: date("spent_on").notNull(),
  receiptR2Key: text("receipt_r2_key"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const vaultItems = pgTable("vault_items", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  kind: text("kind").notNull().default("other"),
  expiresOn: date("expires_on"),
  r2Key: text("r2_key"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const homeItems = pgTable("home_items", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  location: text("location").notNull().default(""),
  quantity: integer("quantity").notNull().default(1),
  r2Key: text("r2_key"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const shoppingItems = pgTable("shopping_items", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  bought: boolean("bought").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const homeBills = pgTable("home_bills", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  amountSatang: integer("amount_satang").notNull().default(0),
  dueOn: date("due_on"),
  paid: boolean("paid").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const journalEntries = pgTable(
  "journal_entries",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    entryOn: date("entry_on").notNull(),
    body: text("body").notNull().default(""),
    mood: text("mood").notNull().default("ok"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("journal_user_day").on(t.userId, t.entryOn)],
);

export const journalPhotos = pgTable("journal_photos", {
  id: text("id").primaryKey(),
  entryId: text("entry_id")
    .notNull()
    .references(() => journalEntries.id, { onDelete: "cascade" }),
  r2Key: text("r2_key").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const families = pgTable("families", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  joinCode: text("join_code").notNull().unique(),
  joinCodeExpiresAt: timestamp("join_code_expires_at"),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const familyMembers = pgTable(
  "family_members",
  {
    id: text("id").primaryKey(),
    familyId: text("family_id")
      .notNull()
      .references(() => families.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("member"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("family_member_pair").on(t.familyId, t.userId),
    uniqueIndex("family_member_user").on(t.userId),
  ],
);

export const familyMessages = pgTable("family_messages", {
  id: text("id").primaryKey(),
  familyId: text("family_id")
    .notNull()
    .references(() => families.id, { onDelete: "cascade" }),
  channel: text("channel").notNull(),
  senderId: text("sender_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  imageR2Key: text("image_r2_key"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const familyChannelReads = pgTable(
  "family_channel_reads",
  {
    id: text("id").primaryKey(),
    familyId: text("family_id")
      .notNull()
      .references(() => families.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    channel: text("channel").notNull(),
    lastReadAt: timestamp("last_read_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("family_channel_read_pair").on(t.familyId, t.userId, t.channel)],
);

export const familyLocationShares = pgTable(
  "family_location_shares",
  {
    id: text("id").primaryKey(),
    familyId: text("family_id")
      .notNull()
      .references(() => families.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at").notNull(),
    lat: text("lat").notNull().default(""),
    lng: text("lng").notNull().default(""),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("family_location_user").on(t.familyId, t.userId)],
);

export const familyShoppingItems = pgTable("family_shopping_items", {
  id: text("id").primaryKey(),
  familyId: text("family_id")
    .notNull()
    .references(() => families.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  bought: boolean("bought").notNull().default(false),
  shopOn: date("shop_on"),
  assigneeId: text("assignee_id").references(() => user.id, { onDelete: "set null" }),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const familyChores = pgTable("family_chores", {
  id: text("id").primaryKey(),
  familyId: text("family_id")
    .notNull()
    .references(() => families.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  dueOn: date("due_on"),
  done: boolean("done").notNull().default(false),
  assigneeId: text("assignee_id").references(() => user.id, { onDelete: "set null" }),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const familyAppointments = pgTable("family_appointments", {
  id: text("id").primaryKey(),
  familyId: text("family_id")
    .notNull()
    .references(() => families.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at"),
  place: text("place").notNull().default(""),
  assigneeId: text("assignee_id").references(() => user.id, { onDelete: "set null" }),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const huntProjects = pgTable("hunt_projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  developer: text("developer").notNull(),
  zone: text("zone").notNull(),
  houseType: text("house_type").notNull().default("detached"),
  hasDetached: boolean("has_detached").notNull().default(true),
  hasTwin: boolean("has_twin").notNull().default(false),
  priceStartSatang: integer("price_start_satang").notNull(),
  priceMaxSatang: integer("price_max_satang"),
  priceNote: text("price_note").notNull().default(""),
  landNote: text("land_note").notNull().default(""),
  landWahTenths: integer("land_wah_tenths"),
  usableSqmMin: integer("usable_sqm_min"),
  usableSqmMax: integer("usable_sqm_max"),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  parking: integer("parking"),
  fitScore: integer("fit_score").notNull(),
  valueScore: integer("value_score").notNull(),
  rank: integer("rank").notNull(),
  commuteNote: text("commute_note").notNull().default(""),
  sizeNote: text("size_note").notNull().default(""),
  caveat: text("caveat").notNull().default(""),
  lat: text("lat").notNull().default(""),
  lng: text("lng").notNull().default(""),
  traffic: text("traffic").notNull().default("orange"),
  hospitalNote: text("hospital_note").notNull().default(""),
  mallNote: text("mall_note").notNull().default(""),
  highwayNote: text("highway_note").notNull().default(""),
  schoolNote: text("school_note").notNull().default(""),
  pros: text("pros").notNull().default(""),
  cons: text("cons").notNull().default(""),
  budgetUnder6: boolean("budget_under_6").notNull().default(false),
  unitCheck: boolean("unit_check").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const huntPriceNotes = pgTable("hunt_price_notes", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => huntProjects.id, { onDelete: "cascade" }),
  source: text("source").notNull(),
  priceSatang: integer("price_satang"),
  note: text("note").notNull().default(""),
  asOf: date("as_of").notNull(),
});

export const huntFamilyPicks = pgTable(
  "hunt_family_picks",
  {
    id: text("id").primaryKey(),
    familyId: text("family_id")
      .notNull()
      .references(() => families.id, { onDelete: "cascade" }),
    projectId: text("project_id")
      .notNull()
      .references(() => huntProjects.id, { onDelete: "cascade" }),
    shortlisted: boolean("shortlisted").notNull().default(false),
    note: text("note").notNull().default(""),
    updatedBy: text("updated_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("hunt_pick_family_project").on(t.familyId, t.projectId)],
);

export const huntVotes = pgTable(
  "hunt_votes",
  {
    id: text("id").primaryKey(),
    familyId: text("family_id")
      .notNull()
      .references(() => families.id, { onDelete: "cascade" }),
    projectId: text("project_id")
      .notNull()
      .references(() => huntProjects.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    score: integer("score").notNull(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("hunt_vote_member").on(t.familyId, t.projectId, t.userId)],
);

export const huntCompareSets = pgTable("hunt_compare_sets", {
  id: text("id").primaryKey(),
  familyId: text("family_id")
    .notNull()
    .references(() => families.id, { onDelete: "cascade" })
    .unique(),
  projectIds: text("project_ids").notNull().default(""),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const huntVisits = pgTable("hunt_visits", {
  id: text("id").primaryKey(),
  familyId: text("family_id")
    .notNull()
    .references(() => families.id, { onDelete: "cascade" }),
  projectId: text("project_id")
    .notNull()
    .references(() => huntProjects.id, { onDelete: "cascade" }),
  visitedOn: date("visited_on").notNull(),
  startsAt: timestamp("starts_at"),
  place: text("place").notNull().default(""),
  summary: text("summary").notNull().default(""),
  appointmentId: text("appointment_id").references(() => familyAppointments.id, {
    onDelete: "set null",
  }),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const huntVisitPhotos = pgTable("hunt_visit_photos", {
  id: text("id").primaryKey(),
  visitId: text("visit_id")
    .notNull()
    .references(() => huntVisits.id, { onDelete: "cascade" }),
  r2Key: text("r2_key").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
