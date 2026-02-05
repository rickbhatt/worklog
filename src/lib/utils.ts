import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDateTime = (date: string | Date | undefined) => {
  if (!date)
    return { dateMonthOnly: "", shortDateWithYear: "", dateToISOString: "" };

  const formatDateMonth = format(new Date(date), "d MMM");

  const formatShortDateWithYear = format(new Date(date), "d MMM yyyy");

  const formatDateToISOString = format(new Date(date), "yyyy-MM-dd");

  return {
    dateMonthOnly: formatDateMonth,
    shortDateWithYear: formatShortDateWithYear,
    dateToISOString: formatDateToISOString,
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

export const convertTimeTakenToHoursMins = (time: number | undefined) => {
  if (!time) return "";

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
