/**
 * Themes the native Android date picker dialog (@react-native-community/datetimepicker)
 * with the app's "Crimson Noir" colours, in light and dark mode.
 *
 * The picker is the framework android.app.DatePickerDialog, so it must be themed
 * with a *framework* dialog theme. AppCompat dialog themes (which the library's own
 * plugin uses) draw a hard-coded white window background that only AppCompat's own
 * dialogs tint, so the dialog stayed white in dark mode.
 *
 * This plugin defines the same style twice:
 *   values/styles.xml        -> android:Theme.Material.Light.Dialog
 *   values-night/styles.xml  -> android:Theme.Material.Dialog
 * and overrides only the accent and background (via day/night colour resources),
 * so text colours and the disabled-date styling stay the platform's own.
 *
 * Colours mirror src/theme/tokens.ts (surface, accent).
 */
const fs = require("fs");
const path = require("path");
const {
  AndroidConfig,
  XML,
  withAndroidColors,
  withAndroidColorsNight,
  withAndroidStyles,
  withDangerousMod,
} = require("expo/config-plugins");

const STYLE_NAME = "WorklogDatePickerDialog";

const COLORS = {
  datePickerSurface: { light: "#FFFFFF", dark: "#1A1418" },
  datePickerAccent: { light: "#C8102E", dark: "#FF5C78" },
};

// The dark Material date picker paints its header grey instead of the accent,
// so the header colour is set explicitly through the widget style. Its parent
// must match the scheme too, or the header text loses its white colour in light.
const WIDGET_STYLE_NAME = "WorklogDatePicker";
const WIDGET_PARENTS = {
  light: "android:Widget.Material.Light.DatePicker",
  dark: "android:Widget.Material.DatePicker",
};

const ITEMS = {
  "android:datePickerStyle": `@style/${WIDGET_STYLE_NAME}`,
  "android:colorAccent": "@color/datePickerAccent",
  "android:colorControlActivated": "@color/datePickerAccent",
  "android:colorBackground": "@color/datePickerSurface",
};

const PARENTS = {
  light: "android:Theme.Material.Light.Dialog",
  dark: "android:Theme.Material.Dialog",
};

const assignColors = (xml, scheme) =>
  Object.entries(COLORS).reduce(
    (acc, [name, value]) =>
      AndroidConfig.Colors.assignColorValue(acc, { name, value: value[scheme] }),
    xml,
  );

const assignDialogStyle = (xml, scheme) => {
  // Drop any earlier copies so a changed parent takes effect.
  if (xml.resources.style) {
    xml.resources.style = xml.resources.style.filter(
      (s) => s.$.name !== STYLE_NAME && s.$.name !== WIDGET_STYLE_NAME,
    );
  }
  for (const [name, value] of Object.entries(ITEMS)) {
    xml = AndroidConfig.Styles.assignStylesValue(xml, {
      add: true,
      name,
      value,
      parent: { name: STYLE_NAME, parent: PARENTS[scheme] },
    });
  }
  return AndroidConfig.Styles.assignStylesValue(xml, {
    add: true,
    name: "android:headerBackground",
    value: "@color/datePickerAccent",
    parent: { name: WIDGET_STYLE_NAME, parent: WIDGET_PARENTS[scheme] },
  });
};

const withDatePickerTheme = (config) => {
  config = withAndroidColors(config, (cfg) => {
    cfg.modResults = assignColors(cfg.modResults, "light");
    return cfg;
  });

  config = withAndroidColorsNight(config, (cfg) => {
    cfg.modResults = assignColors(cfg.modResults, "dark");
    return cfg;
  });

  config = withAndroidStyles(config, (cfg) => {
    let xml = assignDialogStyle(cfg.modResults, "light");
    xml = AndroidConfig.Styles.assignStylesValue(xml, {
      add: true,
      name: "android:datePickerDialogTheme",
      value: `@style/${STYLE_NAME}`,
      parent: AndroidConfig.Styles.getAppThemeGroup(),
    });
    cfg.modResults = xml;
    return cfg;
  });

  // Expo has no mod for values-night/styles.xml, so write it directly.
  config = withDangerousMod(config, [
    "android",
    async (cfg) => {
      const file = path.join(
        cfg.modRequest.platformProjectRoot,
        "app/src/main/res/values-night/styles.xml",
      );
      const xml = await AndroidConfig.Resources.readResourcesXMLAsync({
        path: file,
        fallback: "<resources></resources>",
      });
      await fs.promises.mkdir(path.dirname(file), { recursive: true });
      await XML.writeXMLAsync({ path: file, xml: assignDialogStyle(xml, "dark") });
      return cfg;
    },
  ]);

  return config;
};

module.exports = withDatePickerTheme;
