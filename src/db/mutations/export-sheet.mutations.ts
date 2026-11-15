import { exportSheet } from "@/db/schema";
import { getCurrentMonthKey } from "@/lib/utils";
import { ne, sql } from "drizzle-orm";
import { Db } from "type";

// Saves (or replaces) the sheet url and name for the current month.
export const saveCurrentMonthExportSheet = async ({
  db,
  sheetUrl,
  sheetName,
}: {
  db: Db;
  sheetUrl: string;
  sheetName: string;
}) => {
  await db
    .insert(exportSheet)
    .values({ month: getCurrentMonthKey(), sheetUrl, sheetName })
    .onConflictDoUpdate({
      target: exportSheet.month,
      set: { sheetUrl, sheetName, updatedAt: sql`CURRENT_TIMESTAMP` },
    });
};

// Removes sheets saved for any month other than the current one.
export const clearStaleExportSheets = async (db: Db) => {
  await db.delete(exportSheet).where(ne(exportSheet.month, getCurrentMonthKey()));
};
