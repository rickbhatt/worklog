import { sqliteTable, text } from "drizzle-orm/sqlite-core";

// The Google Sheet used for "Existing sheet" exports in a given month.
// One row per month; rows from past months are cleared on app load.
export const exportSheet = sqliteTable("export_sheet", {
  month: text("month").primaryKey(), // yyyy-MM of the month this sheet is for

  sheetUrl: text("sheet_url").notNull(),

  sheetName: text("sheet_name").notNull(),

  updatedAt: text("updated_at").notNull().default("CURRENT_TIMESTAMP"),
});
