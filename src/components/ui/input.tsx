import { cn } from "@/lib/utils";
import { useTheme } from "@/theme/theme-provider";
import { Text, TextInput, View, type TextInputProps } from "react-native";

type InputProps = TextInputProps &
  React.RefAttributes<TextInput> & {
    /** Muted unit shown inside the field, e.g. "pages" or "min". */
    suffix?: string;
    /** Element rendered at the left edge inside the field (e.g. an icon). */
    left?: React.ReactNode;
    /** Element rendered at the right edge inside the field (e.g. a QR button). */
    right?: React.ReactNode;
    /** Large Manrope number style, for numeric fields. */
    numeric?: boolean;
    containerClassName?: string;
    /** Swap the TextInput, e.g. BottomSheetTextInput inside a bottom sheet. */
    as?: React.ComponentType<TextInputProps>;
  };

/**
 * Themed text field: 52px, surface background, 1px line border, 14px radius,
 * soft card shadow. Prefix/suffix/right slots sit inside the field.
 */
function Input({
  className,
  containerClassName,
  suffix,
  left,
  right,
  numeric,
  editable,
  style,
  as: InputComponent = TextInput,
  ...props
}: InputProps) {
  const { colors, shadows } = useTheme();

  return (
    <View
      className={cn(
        "h-[52px] flex-row items-center gap-2.5 rounded-[14px] border border-line bg-surface px-4",
        right && "pr-1.5",
        editable === false && "opacity-60",
        containerClassName,
      )}
      style={{ boxShadow: shadows.card }}
    >
      {left}
      <InputComponent
        className={cn(
          "h-full min-w-0 flex-1 py-0 text-foreground",
          numeric
            ? "font-manrope-bold text-lg"
            : "font-inter-medium text-base",
          className,
        )}
        placeholderTextColor={colors.muted}
        selectionColor={colors.accent}
        cursorColor={colors.accent}
        editable={editable}
        style={style}
        {...props}
      />
      {suffix ? (
        <Text className="font-inter text-[13px] text-muted">{suffix}</Text>
      ) : null}
      {right}
    </View>
  );
}

export { Input };
export type { InputProps };
