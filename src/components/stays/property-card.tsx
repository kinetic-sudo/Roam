import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { styled } from "react-native-css";

import { Icon, PressableScale, Text } from "@/components/ui";
import { imageUrl } from "@/lib/sanity";
import { placeLabel, type HomeStay } from "@/lib/stays";

import { stayIcons } from "./icon";
import { PinIcon } from "./pin-icon";

const StyledImage = styled(Image, { className: "style" });

/** Large photo card on Home. Tapping it opens the stay. */
export function PropertyCard({ stay }: { stay: HomeStay }) {
  const router = useRouter();
  const photo = stay.photos?.[0];
  const url = photo?.asset?.url;

  return (
    <PressableScale
      onPress={() => router.push({ pathname: "/stay/[slug]", params: { slug: stay.slug.current } })}
      accessibilityRole="button"
      accessibilityLabel={`${stay.title}, ${placeLabel(stay)}. Rated ${stay.rating.toFixed(1)}, $${stay.pricePerNight} a night.`}
      accessibilityHint="Opens the stay"
      className="h-65 overflow-hidden rounded-xl bg-surface-muted corner-squircle"
    >
      {url ? (
        <StyledImage
          source={{ uri: imageUrl(url, 1000) }}
          contentFit="cover"
          transition={200}
          className="absolute inset-0"
          accessibilityLabel={photo?.alt || undefined}
        />
      ) : (
        // 14 seeded stays have no photo yet.
        <View className="absolute inset-0 items-center justify-center">
          <Icon name={stayIcons.homeFill} size={40} tone="subtle" />
        </View>
      )}

      {/* Legibility: darken the lower 60% of the photo */}
      <View className="absolute inset-x-0 bottom-0 h-3/5 bg-linear-to-t from-ink/70 to-transparent" />

      <View className="absolute right-3 top-3 h-10 flex-row items-center gap-1.5 rounded-full bg-surface px-4">
        <Icon name={stayIcons.star} size={18} />
        <Text variant="subtitle">{stay.rating.toFixed(1)}</Text>
      </View>

      <View className="absolute bottom-5 left-5 right-24 gap-1">
        <View className="flex-row items-center gap-1.5">
          <PinIcon size={18} />
          <Text variant="caption" tone="inverse" numberOfLines={1}>
            {placeLabel(stay)}
          </Text>
        </View>
        <Text variant="heading" tone="inverse" numberOfLines={2}>
          {stay.title}
        </Text>
      </View>

      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        className="absolute bottom-4 right-4 size-14 items-center justify-center rounded-full bg-surface"
      >
        <Icon name={stayIcons.chevronRight} size={24} />
      </View>
    </PressableScale>
  );
}

/** Loading placeholder: the same footprint as a card. */
export function PropertyCardSkeleton() {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="h-65 rounded-xl bg-surface-muted corner-squircle"
    />
  );
}
