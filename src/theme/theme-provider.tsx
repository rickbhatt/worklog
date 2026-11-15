import {
  ColorScheme,
  FONTS,
  GRADIENT,
  Palette,
  palettes,
  Shadows,
  shadows,
  toCssVars,
} from "@/theme/tokens";
import { vars } from "nativewind";
import React, { createContext, useContext, useMemo } from "react";
import { useColorScheme, View } from "react-native";

type Theme = {
  scheme: ColorScheme;
  isDark: boolean;
  colors: Palette;
  shadows: Shadows;
  gradient: typeof GRADIENT;
  fonts: typeof FONTS;
};

const build = (scheme: ColorScheme): Theme => ({
  scheme,
  isDark: scheme === "dark",
  colors: palettes[scheme],
  shadows: shadows[scheme],
  gradient: GRADIENT,
  fonts: FONTS,
});

const THEMES = { dark: build("dark"), light: build("light") };

const CSS_VARS = {
  dark: vars(toCssVars(palettes.dark)),
  light: vars(toCssVars(palettes.light)),
};

const ThemeContext = createContext<Theme>(THEMES.dark);

/**
 * Follows the system colour scheme. Wraps the whole app (including portal
 * hosts) so every NativeWind colour class resolves from the active palette.
 */
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const system = useColorScheme();
  const scheme: ColorScheme = system === "light" ? "light" : "dark";
  const theme = useMemo(() => THEMES[scheme], [scheme]);

  return (
    <ThemeContext.Provider value={theme}>
      <View style={[{ flex: 1, backgroundColor: theme.colors.bg }, CSS_VARS[scheme]]}>
        {children}
      </View>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
