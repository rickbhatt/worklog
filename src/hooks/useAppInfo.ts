import * as Application from "expo-application";

interface AppInfoTypes {
  appVersion: string;
  appName: string;
  currentYear: number;
}

export const useAppInfo = (): AppInfoTypes => {
  return {
    appName: Application.applicationName || "Unknown",
    appVersion: Application.nativeApplicationVersion || "Unknown",
    currentYear: new Date().getFullYear(),
  };
};
