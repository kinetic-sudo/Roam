import { Image } from "expo-image";
import { View } from "react-native";
import { styled } from "react-native-css";

import { Icon, Text } from "@/components/ui";
import type { Property } from "@/data/properties";

import { stayIcons } from "./icons";
import { PinIcon } from "./pin-icon";

const StyledImage = styled(Image, { className: "style" });

/** Large photo card, shared by Home and Search. Not tappable yet (no detail screen), so the chevron is decorative. */
export function PropertyCard({ property: p }: { property: Property }) {
  return (
    <View
      accessible
      accessibilityLabel={`${p.title}, ${p.city}, ${p.region}. Rated ${p.rating.toFixed(1)}, $${p.pricePerNight} a night.`}
      className="h-65 overflow-hidden rounded-xl bg-surface-muted corner-squircle"
    >
      <StyledImage source={{ uri: p.imageUrl }} contentFit="cover" transition={200} className="absolute inset-0" />

      {/* Legibility: darken the lower 60% of the photo */}
      <View className="absolute inset-x-0 bottom-0 h-3/5 bg-linear-to-t from-ink/70 to-transparent" />

      <View className="absolute right-3 top-3 h-10 flex-row items-center gap-1.5 rounded-full bg-surface px-4">
        <Icon name={stayIcons.star} size={18} />
        <Text variant="subtitle">{p.rating.toFixed(1)}</Text>
      </View>

      <View className="absolute bottom-5 left-5 right-24 gap-1">
        <View className="flex-row items-center gap-1.5">
          <PinIcon size={18} />
          <Text variant="caption" tone="inverse" numberOfLines={1}>
            {p.city}, {p.region}
          </Text>
        </View>
        <Text variant="heading" tone="inverse" numberOfLines={2}>
          {p.title}
        </Text>
      </View>

      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        className="absolute bottom-4 right-4 size-14 items-center justify-center rounded-full bg-surface"
      >
        <Icon name={stayIcons.chevronRight} size={24} />
      </View>
    </View>
  );
}