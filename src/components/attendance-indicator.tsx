import { View } from "react-native";

type AttendanceIndicatorProps = {
  type: "filled" | "stripped" | "outline";
};

const AttendanceIndicator = ({ type }: AttendanceIndicatorProps) => {
  switch (type) {
    case "filled":
      return <View className="h-5 w-5 rounded-sm bg-white" />;

    case "stripped":
      return (
        <View className="h-5 w-5 overflow-hidden rounded-sm border border-dark-300">
          {[-8, 0, 8, 16].map((left) => (
            <View
              key={left}
              className="absolute h-8 w-0.5 bg-white"
              style={{
                left,
                top: -6,
                transform: [{ rotate: "45deg" }],
              }}
            />
          ))}
        </View>
      );
    case "outline":
      return <View className="h-5 w-5 rounded-sm border border-dark-300" />;

    default:
      return null;
  }
};

export default AttendanceIndicator;
