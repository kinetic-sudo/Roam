import { Image } from "expo-image";
import { View } from "react-native";
import { styled } from "react-native-css";

import { Icon, PressableScale, Text } from "@/components/ui";
import type { Property } from "@/data/properties";
import { toggleFavorite, useIsFavorite } from "@/lib/favorites";
import { tapSelection } from "@/lib/haptics";

import type { Tag } from "./amenities";
import { rowIcons } from "./row-icons";
import { StarIcon } from "./star-icons";

const StyledImage = styled(Image, { className: "style" });

/** Compact search result: photo left, details right, save button top right. */
export function PropertyRow({ property: p, tags }: { property: Property; tags: Tag[] }) {
  const saved = useIsFavorite(p.id);

  return (
    <View className="flex-row gap-4">
      <StyledImage
        source={{ uri: p.imageUrl }}
        contentFit="cover"
        transition={200}
        className="h-39 w-35 rounded-lg bg-surface-muted"
        accessibilityLabel={`${p.title}, ${p.city}`}
      />

      <View className="flex-1 gap-2">
        <View className="flex-row items-start gap-2">
          <Text variant="title" numberOfLines={2} className="flex-1">
            {p.title}
          </Text>
          <PressableScale
            onPress={() => {
              tapSelection();
              toggleFavorite(p.id);
            }}
            accessibilityRole="button"
            accessibilityLabel={saved ? `Remove ${p.title} from saved` : `Save ${p.title}`}
            accessibilityState={{ selected: saved }}
            className="size-11 items-center justify-center rounded-full bg-surface-muted"
          >
            <Icon name={saved ? rowIcons.heartFill : rowIcons.heart} size={22} />
          </PressableScale>
        </View>

        <View className="flex-row items-center gap-1.5">
          <Icon name={rowIcons.pin} size={18} />
          <Text tone="muted" numberOfLines={1} className="flex-1">
            {p.city}, {p.region}
          </Text>
        </View>

        <View className="flex-row items-center gap-1.5">
          <StarIcon size={18} />
          <Text variant="subtitle">{p.rating.toFixed(1)}</Text>
          <Text tone="muted">({p.reviewCount})</Text>
        </View>

        {tags.length > 0 ? (
          <View className="flex-row flex-wrap gap-2">
            {tags.map((t) => (
              <View key={t.key} className="h-8 flex-row items-center gap-1.5 rounded-full bg-surface-muted px-3">
                <Icon name={t.icon} size={16} />
                <Text variant="footnote">{t.label}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <Text variant="title">
          ${p.pricePerNight}
          <Text tone="muted"> / night</Text>
        </Text>
      </View>
    </View>
  );
}