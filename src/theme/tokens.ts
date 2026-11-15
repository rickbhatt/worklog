/**
 * "Crimson Noir" design tokens.
 *
 * This is the single source of truth for colour. The same values are exposed
 * two ways:
 *  - as NativeWind CSS variables (see `ThemeProvider`), mapped to Tailwind
 *    colours in tailwind.config.js (`bg-surface`, `text-muted`, …);
 *  - as raw values through `useTheme()`, for props that can't take a class
 *    (icon colours, gradients, shadows, charts, bottom-sheet styles).
 */

export type ColorScheme = "light" | "dark";

export type Palette = {
  bg: string;
  surface: string;
  raised: string;
  line: string;
  text: string;
  muted: string;
  accent: string;
  accentSoft: string;
  onAccent: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  neutral: string;
  neutralSoft: string;
  barInactive: string;
  navBg: string;
  backdrop: string;
  /** Radial glow at the top-left of each screen (colour + opacity). */
  glow: { color: string; opacity: number };
};

export const GRADIENT = {
  colors: ["#E11D48", "#9F1239"] as const,
  // 135deg
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};

export const palettes: Record<ColorScheme, Palette> = {
  dark: {
    bg: "#0D0A0C",
    surface: "#1A1418",
    raised: "#221A1F",
    line: "#2A2025",
    text: "#F6EEF1",
    muted: "#A3959B",
    accent: "#FF5C78",
    accentSoft: "rgba(255,92,120,0.14)",
    onAccent: "#FFFFFF",
    success: "#4ADE80",
    successSoft: "rgba(74,222,128,0.14)",
    warning: "#FBBF24",
    warningSoft: "rgba(251,191,36,0.14)",
    neutral: "#A3959B",
    neutralSoft: "rgba(163,149,155,0.14)",
    barInactive: "#3A2D33",
    // solid: there's no blur behind the tab bar, so any transparency just
    // lets scrolling content show through
    navBg: "#1E161B",
    backdrop: "rgba(0,0,0,0.6)",
    glow: { color: "#FF3B5C", opacity: 0.26 },
  },
  light: {
    bg: "#FBF2F4",
    surface: "#FFFFFF",
    raised: "#F5E6EA",
    line: "rgba(200,16,46,0.08)",
    text: "#1A0F13",
    muted: "#6B5A61",
    accent: "#C8102E",
    accentSoft: "rgba(200,16,46,0.10)",
    onAccent: "#FFFFFF",
    success: "#15803D",
    successSoft: "rgba(21,128,61,0.10)",
    warning: "#B45309",
    warningSoft: "rgba(180,83,9,0.10)",
    neutral: "#6B5A61",
    neutralSoft: "rgba(107,90,97,0.12)",
    barInactive: "#E8CBD2",
    navBg: "#FFFFFF",
    backdrop: "rgba(26,15,19,0.45)",
    glow: { color: "#FF3B5C", opacity: 0.22 },
  },
};

export type Shadows = {
  card: string;
  nav: string;
  /**
   * The one crimson underglow for every gradient element (buttons, the
   * selected segmented option, the hero card). Keep it soft.
   */
  glow: string;
};

export const shadows: Record<ColorScheme, Shadows> = {
  dark: {
    card: "0px 10px 24px 0px rgba(0,0,0,0.35)",
    nav: "0px 16px 40px 0px rgba(0,0,0,0.55)",
    glow: "0px 6px 16px 0px rgba(225,29,72,0.22)",
  },
  light: {
    card: "0px 8px 24px 0px rgba(200,16,46,0.08)",
    nav: "0px 16px 36px 0px rgba(120,10,30,0.14)",
    glow: "0px 6px 16px 0px rgba(200,16,46,0.18)",
  },
};

/** Font family names registered with expo-font in the root layout. */
export const FONTS = {
  inter: "Inter_400Regular",
  interMedium: "Inter_500Medium",
  interSemibold: "Inter_600SemiBold",
  manropeBold: "Manrope_700Bold",
  manropeExtrabold: "Manrope_800ExtraBold",
} as const;

/** CSS variables consumed by tailwind.config.js colours. */
export const toCssVars = (p: Palette) => ({
  "--bg": p.bg,
  "--surface": p.surface,
  "--raised": p.raised,
  "--line": p.line,
  "--text": p.text,
  "--muted": p.muted,
  "--accent": p.accent,
  "--accent-soft": p.accentSoft,
  "--on-accent": p.onAccent,
  "--success": p.success,
  "--success-soft": p.successSoft,
  "--warning": p.warning,
  "--warning-soft": p.warningSoft,
  "--neutral": p.neutral,
  "--neutral-soft": p.neutralSoft,
  "--bar-inactive": p.barInactive,
  "--nav": p.navBg,
});

export type DailyStatus = "success" | "warning" | "neutral";

/** Daily % of target → status colour (≥100 success, 80–99.99 warning, else neutral). */
export const getDailyStatus = (percent: number): DailyStatus =>
  percent >= 100 ? "success" : percent >= 80 ? "warning" : "neutral";
