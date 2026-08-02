import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";
import {
  FileLogsSelectType,
  RequiredField,
  SheetExportData,
  SheetRow,
} from "type";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const parseSheetDate = (dateStr: string): Date => {
  const [month, day, year] = dateStr.split("/");
  return new Date(Number(year), Number(month) - 1, Number(day));
};

export const formatDateTime = (date: string | Date | undefined) => {
  if (!date)
    return { dateMonthOnly: "", shortDateWithYear: "", dateToISOString: "" };

  const formatDateMonth = format(new Date(date), "d MMM");

  const formatShortDateWithYear = format(new Date(date), "d MMM yyyy");

  const formatDateToISOString = format(new Date(date), "yyyy-MM-dd");

  const formatDateForSheet = format(new Date(date), "dd/MM/yyyy");

  const formatDateTimeToISOString = format(
    new Date(date),
    "dd/MM/yyyy, hh:mm a",
  );

  const formatOnlyTime = format(new Date(date), "hh:mm a");

  return {
    dateMonthOnly: formatDateMonth,
    shortDateWithYear: formatShortDateWithYear,
    dateToISOString: formatDateToISOString,
    dateTimeToISOString: formatDateTimeToISOString,
    onlyTime: formatOnlyTime,
    dateForSheet: formatDateForSheet,
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

export const getPreviousMonthRange = (month: string, year: string) => {
  const monthIndex = parseInt(month) - 1;
  const yearNum = parseInt(year);

  const start = new Date(yearNum, monthIndex - 1, 1);
  const end = new Date(yearNum, monthIndex, 0);

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
  if (!targetLepPages || !lepPages) return 0;
  let percent = ((lepPages / targetLepPages) * 100).toFixed(2);

  const [whole, decimal] = percent.split(".");

  return decimal === "00" ? whole : percent;
};

export const calcMomGrowthPercent = ({
  currentTotal,
  previousTotal,
}: {
  currentTotal: number | null | undefined;
  previousTotal: number | null | undefined;
}): { percent: string; isNegative: boolean } => {
  const current = currentTotal ?? 0;
  const previous = previousTotal ?? 0;

  if (current === 0 && previous === 0) {
    return { percent: "0%", isNegative: false };
  }

  if (previous === 0 && current > 0) {
    return { percent: "+100%", isNegative: false };
  }

  if (current === 0 && previous > 0) {
    return { percent: "-100%", isNegative: true };
  }

  const percent = ((current - previous) / previous) * 100;
  const formattedPercent = Number(percent.toFixed(1)).toString();

  if (formattedPercent === "0") {
    return { percent: "0%", isNegative: false };
  }

  return {
    percent: percent > 0 ? `+${formattedPercent}%` : `${formattedPercent}%`,
    isNegative: percent < 0,
  };
};

export function formatBackupSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const determineTodayOrYesterday = (date: string | Date) => {
  if (!date) return "";
  const inputDate = new Date(date);
  const currentDateString = getCurrentDate();

  if (formatDateTime(inputDate).dateToISOString === currentDateString) {
    return "Today";
  }
  const yesterdayDateObj = new Date(currentDateString);
  yesterdayDateObj.setDate(yesterdayDateObj.getDate() - 1);
  const yesterdayDateString = formatDateTime(yesterdayDateObj).dateToISOString;

  if (formatDateTime(inputDate).dateToISOString === yesterdayDateString) {
    return "Yesterday";
  }

  return formatDateTime(inputDate).shortDateWithYear;
};

export const backupDateTimeDisplay = (date: string | Date) => {
  if (!date) return "";
  const dateLabel = determineTodayOrYesterday(date);

  const timeLabel = formatDateTime(date)?.dateTimeToISOString?.split(", ")[1];

  return `${dateLabel}, ${timeLabel}`;
};

export const checkSunday = ({
  currentMonth,
  date,
}: {
  date: number | undefined;

  currentMonth: number;
}) => {
  if (!date) return;
  const currentYear = new Date().getFullYear();
  return new Date(currentYear, currentMonth - 1, date).getDay() === 0;
};

export const checkDateGreaterThanToday = (date: number, month: number) => {
  if (!date) return;
  const currentYear = new Date().getFullYear();

  const dateObj = new Date(currentYear, month - 1, date);
  const today = new Date();
  return dateObj > today;
};

export const formatLogsForSheet = ({
  logs,
  exportType,
}: {
  logs: FileLogsSelectType[];
  exportType: "append" | "create";
}): SheetExportData => {
  const headerElements: string[] = [
    "Date",
    "Task/OT details",
    "Pages",
    "OT pages",
    "Target reached (yes/no)",
    "Remarks",
  ];

  const logsArray: SheetRow[] = logs.map((log) => {
    const pagesValue: number | "SML" | "ND-SML" =
      log.isSml === 0 ? log.lepPages : log.isND === 1 ? "ND-SML" : "SML";

    return [
      formatDateTime(log.workedAt).dateForSheet,
      `${log.journalId}_${log.articleId}`,
      log.isOT === 0 ? pagesValue : "",
      log.isOT === 1 ? pagesValue : "",
      "",
      log.remarks ?? "",
    ];
  });

  return exportType === "create" ? [headerElements, ...logsArray] : logsArray;
};

export const validateHeaders = (rows: string[][]): boolean => {
  const REQUIRED_HEADERS = [
    "Date",
    "JID",
    "AID",
    "Pages",
    "File type",
    "Minutes",
  ];
  const headers = rows[0];

  const hasRequiredHeaders = REQUIRED_HEADERS.every(
    (col, i) => col === headers[i],
  );

  if (!hasRequiredHeaders) return false;

  const optionalHeaders = headers.slice(REQUIRED_HEADERS.length);
  const allowedOptionalHeaders = ["Compensated file", "QC file"];

  return (
    optionalHeaders.length <= allowedOptionalHeaders.length &&
    optionalHeaders.every(
      (header, index) => header === allowedOptionalHeaders[index],
    )
  );
};

export const extractSpreadsheetId = (url: string) => {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : url; // assume it's already a bare ID if no match
};

export const ensureSheetExists = async ({
  accessToken,
  spreadsheetId,
  sheetName,
}: {
  accessToken: string;
  spreadsheetId: string;
  sheetName: string;
}) => {
  const metaRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!metaRes.ok) {
    throw new Error(
      "Could not access this spreadsheet. Check the link and sharing permissions.",
    );
  }

  const meta = await metaRes.json();
  const exists = meta.sheets?.some(
    (s: any) => s.properties.title === sheetName,
  );

  if (!exists) {
    throw new Error(
      `Sheet tab "${sheetName}" was not found in this spreadsheet.`,
    );
  }
};
