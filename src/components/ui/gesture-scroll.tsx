import { cssInterop } from "nativewind";
import { FlatList, ScrollView } from "react-native-gesture-handler";

/**
 * Gesture-handler scroll containers, styleable with NativeWind.
 *
 * Use these instead of React Native's ScrollView / FlatList around pressto
 * pressables: RNGH coordinates the scroll and tap gestures, so a press doesn't
 * flash its scale animation when the touch turns into a scroll.
 * For SectionList, pass `renderScrollComponent={(p) => <ScrollView {...p} />}`.
 */
const interop = {
  className: "style",
  contentContainerClassName: "contentContainerStyle",
} as const;

cssInterop(ScrollView, interop);
cssInterop(FlatList, interop);

export { FlatList, ScrollView };
