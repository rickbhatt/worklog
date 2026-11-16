import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

/** CTR analysis tasks: kept for record only, never counted toward LEP pages. One per date. */
export const ctrLogs = sqliteTable(
  "ctr_logs",
  {
    id: text("id").primaryKey(),

    workedAt: text("worked_at").notNull(), // when the CTR was done

    createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),

    updatedAt: text("updated_at").notNull().default("CURRENT_TIMESTAMP"),
  },
  (t) => ({
    workedAtUnique: uniqueIndex("ctr_logs_worked_at_unique").on(t.workedAt),
  }),
);
