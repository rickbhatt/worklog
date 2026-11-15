import { journals } from "@/db/models/journal.schema";
import { eq } from "drizzle-orm";
import type { Db } from "type";

// Same rule as normalizeJournalId in fileworklog.mutations (not imported to
// avoid a circular import: that file saves Journal IDs through this one).
const normalizeJournalId = (journalId: string) =>
  journalId.trim().toUpperCase();

/** Thrown when adding or renaming to a Journal ID that is already saved. */
export class DuplicateJournalIdError extends Error {
  constructor(public journalId: string) {
    super(`${journalId} is already saved`);
    this.name = "DuplicateJournalIdError";
  }
}

/** Stores Journal IDs (already normalized) that aren't saved yet. */
export const saveJournalIds = async (db: Db, journalIds: string[]) => {
  const unique = [...new Set(journalIds.filter(Boolean))];
  if (unique.length === 0) return;

  const createdAt = new Date().toISOString();
  await db
    .insert(journals)
    .values(unique.map((journalId) => ({ journalId, createdAt })))
    .onConflictDoNothing();
};

const assertJournalIdFree = async (db: Db, journalId: string) => {
  const [existing] = await db
    .select({ journalId: journals.journalId })
    .from(journals)
    .where(eq(journals.journalId, journalId))
    .limit(1);
  if (existing) throw new DuplicateJournalIdError(journalId);
};

/** Adds a Journal ID to the suggestions. Returns the stored (normalized) ID. */
export const addJournalId = async (db: Db, journalId: string) => {
  const id = normalizeJournalId(journalId);
  if (!id) throw new Error("Journal ID is empty");

  await assertJournalIdFree(db, id);
  await db
    .insert(journals)
    .values({ journalId: id, createdAt: new Date().toISOString() });
  return id;
};

/**
 * Renames a saved Journal ID. Only the suggestion changes; logs keep the
 * Journal ID they were saved with.
 */
export const renameJournalId = async (
  db: Db,
  from: string,
  to: string,
) => {
  const id = normalizeJournalId(to);
  if (!id) throw new Error("Journal ID is empty");
  if (id === from) return id;

  await assertJournalIdFree(db, id);
  await db
    .update(journals)
    .set({ journalId: id })
    .where(eq(journals.journalId, from));
  return id;
};

/** Removes a Journal ID from the suggestions. Logs that use it are kept. */
export const deleteJournalId = async (db: Db, journalId: string) => {
  await db.delete(journals).where(eq(journals.journalId, journalId));
};
