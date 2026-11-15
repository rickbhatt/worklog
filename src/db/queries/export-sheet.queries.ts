import { exportSheet } from "@/db/schema";
import { getCurrentMonthKey } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { Db } from "type";

// The sheet saved for the current month, if any.
export const getCurrentMonthExportSheet = (db: Db) => {
  const [row] = db
    .select()
    .from(exportSheet)
    .where(eq(exportSheet.month, getCurrentMonthKey()))
    .limit(1)
    .all();
  return row;
};
