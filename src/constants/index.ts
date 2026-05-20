import { Paths } from "expo-file-system";

export const DB_NAME = "worklog.db";

export const BACKUP_STATE_ID = "gdrive_backup";

export const BACKUP_FILE_NAME = "worklog_backup.db";

export const BACKUP_CHANNEL_ID = "backup";
export const BACKUP_NOTIFICATION_ID = "gdrive-backup-progress";

export const DRIVE_BASE_URL = "https://www.googleapis.com";

export const BACKUP_DIR_PATH = `${Paths.document.uri}backup/databases`;
export const LIVE_DB_PATH = `${Paths.document.uri}SQLite/${DB_NAME}`;

export const MONTHS = [
  { label: "January", value: "1" },
  { label: "February", value: "2" },
  { label: "March", value: "3" },
  { label: "April", value: "4" },
  { label: "May", value: "5" },
  { label: "June", value: "6" },
  { label: "July", value: "7" },
  { label: "August", value: "8" },
  { label: "September", value: "9" },
  { label: "October", value: "10" },
  { label: "November", value: "11" },
  { label: "December", value: "12" },
];

export const MONTH_NAMES: Record<string, string> = {
  "1": "January",
  "2": "February",
  "3": "March",
  "4": "April",
  "5": "May",
  "6": "June",
  "7": "July",
  "8": "August",
  "9": "September",
  "10": "October",
  "11": "November",
  "12": "December",
};

export const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
