import { attendanceOverrides } from "@/db/models/attendance.schema";
import { getMonthRange } from "@/lib/utils";
import { and, eq, gte, lte } from "drizzle-orm";
import { Db } from "type";

export const getAttendanceOverrideByDate = async (db: Db, date: string) => {
  const [row] = await db
    .select()
    .from(attendanceOverrides)
    .where(eq(attendanceOverrides.date, date));

  return row;
};

export const getAttendanceOverridesForMonth = ({
  db,
  month,
}: {
  db: Db;
  month: string;
}) => {
  const currentYear = new Date().getFullYear();
  const { start, end } = getMonthRange(month, currentYear.toString());

  return db
    .select()
    .from(attendanceOverrides)
    .where(
      and(
        gte(attendanceOverrides.date, start),
        lte(attendanceOverrides.date, end),
      ),
    );
};
