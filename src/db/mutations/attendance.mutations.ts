import { attendanceOverrides } from "@/db/models/attendance.schema";
import { eq } from "drizzle-orm";
import { AttendanceOverrideCreateType, Db } from "type";

export const upsertAttendanceOverride = async (
  db: Db,
  data: AttendanceOverrideCreateType,
) => {
  try {
    const [row] = await db
      .insert(attendanceOverrides)
      .values({
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: undefined,
      })
      .onConflictDoUpdate({
        target: attendanceOverrides.date,
        set: {
          type: data.type,
          updatedAt: new Date().toISOString(),
        },
      })
      .returning({
        date: attendanceOverrides.date,
        type: attendanceOverrides.type,
      });

    return row;
  } catch (error) {
    console.error("[upsertAttendanceOverride] failed", error);
    throw error;
  }
};

export const deleteAttendanceOverrideByDate = async (
  db: Db,
  date: string,
) => {
  try {
    const [row] = await db
      .delete(attendanceOverrides)
      .where(eq(attendanceOverrides.date, date))
      .returning({
        date: attendanceOverrides.date,
      });

    return row;
  } catch (error) {
    console.error("[deleteAttendanceOverrideByDate] failed", error);
    throw error;
  }
};
