import { cn } from "@/lib/utils";
import { View } from "react-native";

const cornerBase = "absolute w-10 h-10 border-white";

const ScannerFrame = () => (
  <View className="absolute top-1/2 left-1/2 w-64 h-64 -ml-32 -mt-32">
    {/* Top-left */}
    <View
      className={cn(
        cornerBase,
        "top-0 left-0 border-t-4 border-l-4 rounded-tl-xl",
      )}
    />
    {/* Top-right */}
    <View
      className={cn(
        cornerBase,
        "top-0 right-0 border-t-4 border-r-4 rounded-tr-xl",
      )}
    />
    {/* Bottom-left */}
    <View
      className={cn(
        cornerBase,
        "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-xl",
      )}
    />
    {/* Bottom-right */}
    <View
      className={cn(
        cornerBase,
        "bottom-0 right-0 border-b-4 border-r-4 rounded-br-xl",
      )}
    />
  </View>
);

export default ScannerFrame;
