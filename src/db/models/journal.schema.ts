import { sql } from "drizzle-orm";
import { check, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Every Journal ID ever logged, stored once (upper case, trimmed). Used to
// suggest Journal IDs while typing in the log form.
export const journals = sqliteTable(
  "journals",
  {
    journalId: text("journal_id").primaryKey(),

    createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
  },
  (t) => [
    // The primary key is case-sensitive, so the database also insists on the
    // normalized form: "npp2" or " NPP2" can't sit beside "NPP2".
    check(
      "journals_journal_id_normalized",
      sql`${t.journalId} = upper(trim(${t.journalId})) AND ${t.journalId} <> ''`,
    ),
  ],
);
