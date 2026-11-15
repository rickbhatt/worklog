import { cn } from "@/lib/utils";
import { useTheme } from "@/theme/theme-provider";
import {
  Platform,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

/**
 * Multi-line field. The background, border, shadow and padding live on a
 * wrapper View (like `Input`): on Android, redrawing a TextInput's own
 * background (e.g. on a light/dark switch) resets its padding.
 */
function Textarea({
  className,
  multiline = true,
  numberOfLines = Platform.select({ web: 2, native: 8 }), // On web, numberOfLines also determines initial height. On native, it determines the maximum height.
  style,
  ...props
}: TextInputProps & React.RefAttributes<TextInput>) {
  const { colors, shadows } = useTheme();

  return (
    <View
      className={cn(
        "min-h-[96px] w-full rounded-[14px] border border-line bg-surface px-5 py-[18px]",
        props.editable === false && "opacity-60",
      )}
      style={{ boxShadow: shadows.card }}
    >
      <TextInput
        className={cn(
          "flex-1 p-0 font-inter text-[15px] leading-[22px] text-foreground",
          className,
        )}
        style={style}
        placeholderTextColor={colors.muted}
        selectionColor={colors.accent}
        cursorColor={colors.accent}
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical="top"
        {...props}
      />
    </View>
  );
}

export { Textarea };
