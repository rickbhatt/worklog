import { cssInterop } from "nativewind";
import {
  PressableScale as PresstoPressableScale,
  PressablesConfig,
  type CustomPressableProps,
} from "pressto";
import type { ReactNode } from "react";

/**
 * Pressto's scale pressable, made styleable with NativeWind `className`.
 *
 * Use this (or `Button`) for anything tappable instead of React Native's
 * `Pressable`, so every touch target shares pressto's scale feedback.
 */
const PressableScale = cssInterop(PresstoPressableScale, {
  className: "style",
});

type PressableScaleProps = CustomPressableProps & { className?: string };

/**
 * App-wide pressto defaults. Mounted once in the root layout, inside
 * GestureHandlerRootView.
 */
function PressableProvider({ children }: { children: ReactNode }) {
  return (
    <PressablesConfig
      animationType="timing"
      config={{ minScale: 0.95 }}
      // RNGH's BaseButton shows an Android ripple by default; the scale is the
      // only press feedback we want.
      defaultProps={{ rippleColor: "transparent" }}
    >
      {children}
    </PressablesConfig>
  );
}

export { PressableProvider, PressableScale };
export type { PressableScaleProps };
