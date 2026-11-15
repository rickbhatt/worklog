import { cn } from "@/lib/utils";
import { DailyStatus, getDailyStatus } from "@/theme/tokens";
import React from "react";
import { Text, View } from "react-native";

type Tone = "accent" | "raised" | DailyStatus;

const TONES: Record<Tone, { bg: string; text: string }> = {
  accent: { bg: "bg-accent-soft", text: "text-accent" },
  raised: { bg: "bg-raised", text: "text-muted" },
  success: { bg: "bg-success-soft", text: "text-success" },
  warning: { bg: "bg-warning-soft", text: "text-warning" },
  neutral: { bg: "bg-neutral-soft", text: "text-neutral" },
};

/** Small 8px-radius pill: soft tinted background with coloured text. */
export const Pill = ({
  tone = "accent",
  children,
  icon,
  className,
  textClassName,
}: {
  tone?: Tone;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  textClassName?: string;
}) => (
  <View
    className={cn(
      "flex-row items-center gap-1 rounded-lg px-2 py-1",
      TONES[tone].bg,
      className,
    )}
  >
    {icon}
    <Text
      numberOfLines={1}
      textBreakStrategy="simple"
      className={cn(
        "font-inter-semibold text-xs tabular-nums",
        TONES[tone].text,
        textClassName,
      )}
    >
      {children}
    </Text>
  </View>
);

/** Small label tag: accent (file type in the log details sheet) or raised/muted (flags). */
export const TypeTag = ({ label, accent }: { label: string; accent?: boolean }) => (
  <View
    className={cn(
      "self-start rounded-md px-[7px] py-0.5",
      accent ? "bg-accent-soft" : "bg-raised",
    )}
  >
    <Text
      numberOfLines={1}
      textBreakStrategy="simple"
      className={cn(
        "font-inter-semibold text-[11px] tracking-[0.55px]",
        accent ? "text-accent" : "text-muted",
      )}
    >
      {label}
    </Text>
  </View>
);

/** Daily % of target, coloured by the status rule. */
export const StatusPill = ({ percent }: { percent: number }) => {
  const label = Number.isInteger(percent)
    ? `${percent}%`
    : `${percent.toFixed(2)}%`;
  return <Pill tone={getDailyStatus(percent)}>{label}</Pill>;
};

export { TONES as PILL_TONES };
