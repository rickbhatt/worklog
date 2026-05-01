import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";
import { RequiredField } from "type";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDateTime = (date: string | Date | undefined) => {
  if (!date)
    return { dateMonthOnly: "", shortDateWithYear: "", dateToISOString: "" };

  const formatDateMonth = format(new Date(date), "d MMM");

  const formatShortDateWithYear = format(new Date(date), "d MMM yyyy");

  const formatDateToISOString = format(new Date(date), "yyyy-MM-dd");

  const formatDateTimeToISOString = format(
    new Date(date),
    "dd/MM/yyyy, hh:mm a",
  );

  return {
    dateMonthOnly: formatDateMonth,
    shortDateWithYear: formatShortDateWithYear,
    dateToISOString: formatDateToISOString,
    dateTimeToISOString: formatDateTimeToISOString,
  };
};

export const getCurrentMonthRange = () => {
  const now = new Date();

  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    start: formatDateTime(start).dateToISOString,
    end: formatDateTime(end).dateToISOString,
  };
};

export const getCurrentDate = (): string => {
  return formatDateTime(new Date()).dateToISOString;
};

export const getMonthRange = (month: string, year: string) => {
  const monthIndex = parseInt(month) - 1; // Convert to zero-based index
  const yearNum = parseInt(year);

  const start = new Date(yearNum, monthIndex, 1);
  const end = new Date(yearNum, monthIndex + 1, 0);

  return {
    start: formatDateTime(start).dateToISOString,
    end: formatDateTime(end).dateToISOString,
  };
};

export const convertTimeTakenToHoursMins = (time: number | undefined) => {
  if (!time || time === 0) return "0m";

  const hours = Math.floor(time / 60);
  const minutes = time % 60;

  if (hours === 0) {
    return `${minutes}m`;
  } else {
    return `${hours}h ${minutes}m`;
  }
};

export function generateBackupId() {
  const time = Date.now(); // milliseconds since epoch
  const rand = Math.random().toString(36).slice(2, 8);

  return `${time}_${rand}`;
}

// Form fields validation

const isEmpty = (value: unknown) =>
  value === null || value === undefined || value === "";

export const validateForm = <T extends Record<string, unknown>>(
  formData: T,
  requiredFields: readonly RequiredField<T>[],
) => {
  return requiredFields.find(({ key }) => isEmpty(formData[key]));
};

export const calcTargetPagePercent = ({
  targetLepPages,
  lepPages,
}: {
  targetLepPages: number;
  lepPages: number;
}) => {
  let percent = ((lepPages / targetLepPages) * 100).toFixed(2);

  const [whole, decimal] = percent.split(".");

  return decimal === "00" ? whole : percent;
};

export function formatBackupSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const determineTodayOrYesterday = (date: string | Date) => {
  const inputDate = new Date(date);
  const now = new Date();
};
