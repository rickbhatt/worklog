import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const fileLogs = sqliteTable(
  "file_logs",
  {
    id: text("id").primaryKey(),

    journalId: text("journal_id").notNull(),

    articleId: text("article_id").notNull(),

    isSml: integer("is_sml").notNull().default(0), // 0 for false and 1 for true

    isND: integer("is_nd").notNull().default(0),

    isOT: integer("is_ot").notNull().default(0),

    timeTaken: integer("time_taken").notNull(), // time in minutes

    lepPages: integer("lep_pages").notNull(),

    workedAt: text("worked_at").notNull(), // when the work actually happened

    remarks: text("remarks"),

    createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),

    updatedAt: text("updated_at").notNull().default("CURRENT_TIMESTAMP"),
  },
  (t) => ({
    workedAtIdx: index("file_logs_worked_at_idx").on(t.workedAt),
  }),
);
