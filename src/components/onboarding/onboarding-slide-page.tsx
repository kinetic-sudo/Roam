import { Image } from "expo-image";
import { View } from "react-native";

import { Icon, Text } from "@/components/ui";
import type { OnboardingSlide } from "@/lib/onboarding/slides";

const iconPin = { ios: "mappin", android: "location_on", web: "location_on" } as const;

type Props = {
  slide: OnboardingSlide;
  width: number;
  imageHeight: number;
};

export function OnboardingSlidePage({ slide, width, imageHeight }: Props) {
  return (
    <View style={{ width }} className="flex-1">
      <View style={{ height: imageHeight }} className="relative w-full overflow-hidden">
        <Image
          source={{ uri: slide.imageUrl }}
          contentFit="cover"
          transition={200}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          accessibilityIgnoresInvertColors
        />
        <View className="absolute bottom-4 left-5 flex-row items-center gap-2 rounded-full border border-scrim-border bg-scrim px-4 py-2">
          <Icon name={iconPin} tone="inverse" size={16} />
          <Text variant="caption" tone="inverse">
            {slide.location}
          </Text>
        </View>
      </View>
    </View>
  );
}
