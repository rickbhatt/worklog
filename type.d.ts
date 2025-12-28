import { fileLogs } from "@/db/models/log.schema";

import {
  AntDesign,
  Entypo,
  Feather,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";

export type IconFamily =
  | "MaterialCommunityIcons"
  | "Ionicons"
  | "FontAwesome"
  | "AntDesign"
  | "Entypo"
  | "MaterialIcons"
  | "Feather";

type DynamicIconProps =
  | {
      family: Extract<IconFamily, "MaterialCommunityIcons">;
      name: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
      size?: number;
      color?: string;
    }
  | {
      family: Extract<IconFamily, "Ionicons">;
      name: React.ComponentProps<typeof Ionicons>["name"];
      size?: number;
      color?: string;
    }
  | {
      family: Extract<IconFamily, "AntDesign">;
      name: React.ComponentProps<typeof AntDesign>["name"];
      size?: number;
      color?: string;
    }
  | {
      family: Extract<IconFamily, "FontAwesome">;
      name: React.ComponentProps<typeof FontAwesome>["name"];
      size?: number;
      color?: string;
    }
  | {
      family: Extract<IconFamily, "Entypo">;
      name: React.ComponentProps<typeof Entypo>["name"];
      size?: number;
      color?: string;
    }
  | {
      family: Extract<IconFamily, "MaterialIcons">;
      name: React.ComponentProps<typeof MaterialIcons>["name"];
      size?: number;
      color?: string;
    }
  | {
      family: Extract<IconFamily, "Feather">;
      name: React.ComponentProps<typeof Feather>["name"];
      size?: number;
      color?: string;
    };

interface TabBarIconProps {
  focused: boolean;
  icon: React.ReactNode;
  title: string;
}

export type InputModeOptions =
  | "none"
  | "text"
  | "decimal"
  | "numeric"
  | "tel"
  | "search"
  | "email"
  | "url";

export interface FileWorklogFormProps {
  value: Partial<FileLogsInsertType>;
  onChange: (data: Partial<FileLogsInsertType>) => void;
  onSubmit: (data: Partial<FileLogsInsertType>) => void;
}

export type FileLogsCreateInput = Omit<
  FileLogsInsertType,
  "id" | "createdAt" | "updatedAt"
>;

export type FieldName = keyof FileLogsInsertType;
export type FileLogsInsertType = typeof fileLogs.$inferInsert;
export type FileLogsUpdateType = typeof fileLogs.$inferUpdate;
export type FileLogsType = typeof fileLogs.$inferSelect;
