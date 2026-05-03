import { BACKUP_CHANNEL_ID, BACKUP_NOTIFICATION_ID } from "@/constants";
import * as Notifications from "expo-notifications";

// Must be called at app startup — outside any component
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function setupNotifications(): Promise<boolean> {
  await Notifications.setNotificationChannelAsync(BACKUP_CHANNEL_ID, {
    name: "Backup",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0],
    sound: null,
  });

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function showBackupInProgressNotification(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    identifier: BACKUP_NOTIFICATION_ID,
    content: {
      title: "WorkLog Backup",
      body: "Backing up to Google Drive...",
    },
    trigger: null,
  });
}

export async function showBackupSuccessNotification(
  lastBackupAt: Date,
): Promise<void> {
  await Notifications.dismissNotificationAsync(BACKUP_NOTIFICATION_ID);

  const timeString = lastBackupAt.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "WorkLog Backup",
      body: `Backed up to Google Drive at ${timeString}`,
    },
    trigger: null,
  });
}

export async function showBackupFailedNotification(): Promise<void> {
  await Notifications.dismissNotificationAsync(BACKUP_NOTIFICATION_ID);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "WorkLog Backup Failed",
      body: "Could not back up to Google Drive. Will retry later.",
    },
    trigger: null,
  });
}
