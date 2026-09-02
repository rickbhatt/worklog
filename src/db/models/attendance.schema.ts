import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const attendanceOverrides = sqliteTable("attendance_overrides", {
  date: text("date").primaryKey(), // ISO date (yyyy-MM-dd) of the day being overridden

  type: text("type", { enum: ["full", "half", "absent"] }).notNull(),

  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),

  updatedAt: text("updated_at").notNull().default("CURRENT_TIMESTAMP"),
});
