import { ctrLogs } from "@/db/models/ctr.schema";
import { formatDateTime } from "@/lib/utils";
import { and, eq, ne } from "drizzle-orm";
import * as Crypto from "expo-crypto";
import { Db } from "type";

/** Thrown when a CTR is already logged for the date. */
export class DuplicateCtrLogError extends Error {
  constructor(public workedAt: string) {
    super(
      `CTR is already logged for ${formatDateTime(workedAt).shortDateWithYear}`,
    );
    this.name = "DuplicateCtrLogError";
  }
}

/** Records a CTR analysis. CTR is kept for record only, with no LEP pages. */
export const createCtrLog = async (db: Db, workedAt: string) => {
  const [existing] = await db
    .select({ id: ctrLogs.id })
    .from(ctrLogs)
    .where(eq(ctrLogs.workedAt, workedAt))
    .limit(1);

  if (existing) throw new DuplicateCtrLogError(workedAt);

  const now = new Date().toISOString();
  const [row] = await db
    .insert(ctrLogs)
    .values({
      id: Crypto.randomUUID(),
      workedAt,
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: ctrLogs.id });

  return row;
};

export const deleteCtrLogById = async (db: Db, id: string) => {
  const [row] = await db
    .delete(ctrLogs)
    .where(eq(ctrLogs.id, id))
    .returning({ id: ctrLogs.id, workedAt: ctrLogs.workedAt });

  return row;
};

/** Moves a CTR to another date, unless that date already has one. */
export const updateCtrLogDate = async (
  db: Db,
  id: string,
  workedAt: string,
) => {
  const [existing] = await db
    .select({ id: ctrLogs.id })
    .from(ctrLogs)
    .where(and(eq(ctrLogs.workedAt, workedAt), ne(ctrLogs.id, id)))
    .limit(1);

  if (existing) throw new DuplicateCtrLogError(workedAt);

  const [row] = await db
    .update(ctrLogs)
    .set({ workedAt, updatedAt: new Date().toISOString() })
    .where(eq(ctrLogs.id, id))
    .returning({ id: ctrLogs.id, workedAt: ctrLogs.workedAt });

  return row;
};
