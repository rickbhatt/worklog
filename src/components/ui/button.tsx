import {
  PressableScale,
  type PressableScaleProps,
} from "@/components/ui/pressable";
import { TextClassContext } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { useTheme } from "@/theme/theme-provider";
import { cva, type VariantProps } from "class-variance-authority";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback } from "react";
import { StyleSheet, View } from "react-native";

const buttonVariants = cva(
  "shrink-0 flex-row items-center justify-center gap-2.5",
  {
    variants: {
      variant: {
        // Primary action: crimson gradient + coloured shadow (drawn in JSX).
        gradient: "",
        secondary: "bg-raised",
        outline: "bg-surface border border-line",
        ghost: "bg-transparent",
        destructive: "bg-accent-soft",
        // kept for existing call sites: a bare 44px icon button
        iconOnly: "bg-transparent",
      },
      size: {
        default: "h-14 px-5 rounded-[18px]",
        sm: "h-11 px-4 rounded-[14px]",
        icon: "h-11 w-11 rounded-[14px] p-0",
      },
    },
    defaultVariants: {
      variant: "gradient",
      size: "default",
    },
  },
);

const buttonTextVariants = cva("", {
  variants: {
    variant: {
      gradient: "font-manrope-extrabold text-base text-on-accent",
      secondary: "font-inter-semibold text-sm text-foreground",
      outline: "font-inter-semibold text-sm text-foreground",
      ghost: "font-inter-semibold text-sm text-foreground",
      destructive: "font-inter-semibold text-sm text-accent",
      iconOnly: "",
    },
    size: {
      default: "",
      sm: "text-sm",
      icon: "",
    },
  },
  defaultVariants: {
    variant: "gradient",
    size: "default",
  },
});

type ButtonProps = Omit<
  PressableScaleProps,
  "children" | "onPress" | "onLongPress"
> &
  VariantProps<typeof buttonVariants> & {
    children?: React.ReactNode;
    onPress?: () => void;
    onLongPress?: () => void;
  };

/**
 * App button, rendered with pressto's PressableScale (scale-on-press feedback)
 * plus haptics. Handlers are called without arguments: pressto reports its own
 * press-state object, not a React Native GestureResponderEvent.
 *
 * The default `gradient` variant is the primary action style (white text on
 * the crimson gradient). Children should use `Text` from `ui/text` so they
 * pick up the variant's text style.
 */
function Button({
  className,
  variant,
  size,
  onPress,
  onLongPress,
  disabled,
  style,
  children,
  ...props
}: ButtonProps) {
  const { gradient, shadows } = useTheme();
  const isGradient = (variant ?? "gradient") === "gradient";
  const radius = size === "sm" || size === "icon" ? 14 : 18;

  const handlePress = useCallback(() => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  }, [onPress, disabled]);

  const handleLongPress = useCallback(() => {
    if (disabled) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onLongPress?.();
  }, [onLongPress, disabled]);

  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
      <PressableScale
        className={cn(
          disabled && "opacity-50",
          buttonVariants({ variant, size }),
          className,
        )}
        style={style}
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled }}
        onPress={handlePress}
        onLongPress={onLongPress ? handleLongPress : undefined}
        disabled={disabled}
        {...props}
      >
        {isGradient && (
          // The shadow lives on a plain rounded View: on the pressable itself
          // Android draws it with square corners.
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              {
                borderRadius: radius,
                boxShadow: disabled ? undefined : shadows.glow,
              },
            ]}
          >
            <LinearGradient
              colors={gradient.colors}
              start={gradient.start}
              end={gradient.end}
              style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
            />
          </View>
        )}
        {children}
      </PressableScale>
    </TextClassContext.Provider>
  );
}

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
