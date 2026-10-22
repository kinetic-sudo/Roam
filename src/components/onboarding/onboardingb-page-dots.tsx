import { View } from "react-native";

// Indicators only, not buttons.
export function PageDots({ count, index }: { count: number; index: number }) {
  return (
    <View className="flex-row gap-2" accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: count, now: index + 1 }}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} className={`h-1.5 w-9 rounded-full ${i === index ? "bg-lavender" : "bg-border"}`} />
      ))}
    </View>
  );
}