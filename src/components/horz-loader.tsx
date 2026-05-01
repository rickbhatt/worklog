import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { HorzLoaderProps } from "type";

const HorzLoader = ({
  loading = true,
  duration = 1200,
  className,
  trackClassName,
  indicatorClassName,
}: HorzLoaderProps) => {
  const [trackWidth, setTrackWidth] = useState(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!loading) {
      progress.value = 0;
      return;
    }

    progress.value = withRepeat(withTiming(1, { duration }), -1, false);
  }, [duration, loading, progress]);

  const indicatorWidth = Math.max(trackWidth * 0.36, 64);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX:
          -indicatorWidth + progress.value * (trackWidth + indicatorWidth),
      },
    ],
  }));

  if (!loading) {
    return null;
  }

  return (
    <View
      className={cn("w-full overflow-hidden", className)}
      onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
    >
      <View
        className={cn(
          "h-1 w-full overflow-hidden rounded-full bg-dark-200",
          trackClassName,
        )}
      >
        {trackWidth > 0 ? (
          <Animated.View
            className={cn("h-full rounded-full bg-accent", indicatorClassName)}
            style={[{ width: indicatorWidth }, indicatorStyle]}
          />
        ) : null}
      </View>
    </View>
  );
};

export default HorzLoader;
