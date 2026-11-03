import { Image } from "expo-image";
import { View } from "react-native";
import { styled } from "react-native-css";

import { StarIcon } from "@/components/stays/star-icons";
import { Icon, PressableScale, Text } from "@/components/ui";
import { useFavorite } from "@/lib/favorites";
import { tapSelection } from "@/lib/haptics";
import { imageUrl } from "@/lib/sanity";
import type { ParsedQuery } from "@/lib/search/parse";
import { matchTags } from "@/lib/search/query";
import { placeLabel, type Stay } from "@/lib/stays";

import { searchIcons, tagIcons } from "./icons";

const StyledImage = styled(Image, { className: "style" });

/** A "why it matched" tag: icon + label. */
export function ResultTag({ label, icon }: { label: string; icon: Parameters<typeof Icon>[0]["name"] }) {
  return (
    <View className="h-6.5 flex-row items-center gap-1.5 rounded-full bg-surface-muted px-2.5">
      <Icon name={icon} size={14} />
      <Text variant="footnote">{label}</Text>
    </View>
  );
}

/** Compact horizontal result: photo, title + heart, place, rating, two tags, price. Not tappable yet (no details screen). */
export function ResultCard({ stay, parsed }: { stay: Stay; parsed: ParsedQuery }) {
  const [saved, toggle] = useFavorite(stay._id);
  const photo = stay.photos?.[0];
  const url = photo?.asset?.url;
  const tags = matchTags(stay, parsed);

  return (
    <View className="flex-row gap-3.5 rounded-xl bg-surface shadow-card">
      {url ? (
        <StyledImage
          source={{ uri: imageUrl(url, 600) }}
          contentFit="cover"
          transition={200}
          className="h-38 w-37 rounded-md bg-surface-muted"
          accessibilityLabel={photo?.alt || `${stay.title}, ${placeLabel(stay)}`}
        />
      ) : (
        // 14 seeded stays have no photo yet.
        <View className="h-38 w-37 items-center justify-center rounded-md bg-surface-muted">
          <Icon name={searchIcons.home} size={28} tone="subtle" />
        </View>
      )}

      <View className="flex-1 justify-between py-1">
        <View>
          <View className="flex-row items-start gap-2">
            {/* Needs the `cardTitle` variant in text.tsx (see SETUP-SEARCH.md) */}
            <Text variant="cardTitle" numberOfLines={2} className="flex-1">
              {stay.title}
            </Text>
            <PressableScale
              onPress={() => {
                tapSelection();
                toggle();
              }}
              accessibilityRole="button"
              accessibilityLabel={saved ? `Remove ${stay.title} from saved` : `Save ${stay.title}`}
              accessibilityState={{ selected: saved }}
              className="size-11 items-center justify-center rounded-full bg-surface-muted"
            >
              <Icon name={saved ? searchIcons.heartFill : searchIcons.heart} size={22} tone={saved ? "danger" : undefined} />
            </PressableScale>
          </View>

          <View className="mt-1.5 flex-row items-center gap-1.5">
            <Icon name={searchIcons.marker} size={16} tone="subtle" />
            <Text variant="caption" tone="subtle" numberOfLines={1} className="flex-1">
              {placeLabel(stay)}
            </Text>
          </View>

          <View className="mt-1.5 flex-row items-center gap-1.5">
            <StarIcon size={18} />
            <Text variant="label">{stay.rating.toFixed(1)}</Text>
            <Text variant="label" tone="subtle">
              ({stay.reviewCount})
            </Text>
          </View>
        </View>

        <View>
          {tags.length > 0 ? (
            <View className="flex-row gap-2">
              {tags.map((t) => (
                <ResultTag key={t.key} label={t.label} icon={tagIcons[t.key]} />
              ))}
            </View>
          ) : null}
          <View className="mt-2 flex-row items-baseline gap-1.5">
            <Text variant="title">${stay.pricePerNight}</Text>
            <Text variant="label" tone="subtle">
              / night
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

/** Loading placeholder: the same footprint as a card. */
export function ResultCardSkeleton() {
  return (
    <View className="flex-row gap-3.5" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View className="h-38 w-37 rounded-md bg-surface-muted" />
      <View className="flex-1 gap-3 py-2">
        <View className="h-5 w-4/5 rounded-full bg-surface-muted" />
        <View className="h-4 w-3/5 rounded-full bg-surface-muted" />
        <View className="h-4 w-2/5 rounded-full bg-surface-muted" />
      </View>
    </View>
  );
}