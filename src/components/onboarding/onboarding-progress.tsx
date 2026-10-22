import { View } from "react-native";

import { cn } from "@/lib/cn";

type Props = {
  count: number;
  activeIndex: number;
  className?: string;
};

export function OnboardingProgress({ count, activeIndex, className }: Props) {
  return (
    <View className={cn("flex-row gap-2", className)}>
      {Array.from({ length: count }, (_, index) => (
        <View
          key={index}
          className={cn(
            "h-1 flex-1 rounded-full",
            index === activeIndex ? "bg-accent" : "bg-border",
          )}
        />
      ))}
    </View>
  );
}
