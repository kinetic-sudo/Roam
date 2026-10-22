import { Pressable, View } from "react-native";

import { Icon, Text } from "@/components/ui";

const iconArrow = { ios: "arrow.right", android: "arrow_forward", web: "arrow_forward" } as const;

type Props = {
  title: string;
  onPress: () => void;
  accessibilityLabel?: string;
};

export function OnboardingPrimaryCta({ title, onPress, accessibilityLabel }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={onPress}
      className="h-14 flex-row items-center rounded-full bg-primary pl-6 pr-2 active:opacity-70"
    >
      <View className="flex-1 items-center">
        <Text variant="button">{title}</Text>
      </View>
      <View className="size-10 items-center justify-center rounded-full bg-ink">
        <Icon name={iconArrow} tone="inverse" size={18} weight="semibold" />
      </View>
    </Pressable>
  );
}
