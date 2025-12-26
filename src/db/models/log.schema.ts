import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const fileLogs = sqliteTable("file_logs", {
  id: text("id").primaryKey(),

  journalId: text("journal_id").notNull(),

  articleId: text("article_id").notNull(),

  timeTaken: integer("time_taken").notNull(), // time in minutes

  pageCount: integer("page_count").notNull(),

  workedAt: text("worked_at").notNull(), // when the work actually happened

  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),

  updatedAt: text("updated_at").notNull().default("CURRENT_TIMESTAMP"),
});
