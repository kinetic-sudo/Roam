import { Image } from "expo-image";
import { View } from "react-native";
import { styled } from "react-native-css";

import { Icon, PressableScale, Text } from "@/components/ui";
import { useFavorite } from "@/lib/favorites";
import { tapSelection } from "@/lib/haptics";
import type { ParsedQuery } from "@/lib/search/parse";
import { matchTags } from "@/lib/search/query";
import type { Stay } from "@/lib/stays";

import { rowIcons } from "./row-icons";
import { StarIcon } from "./star-icons";

const StyledImage = styled(Image, { className: "style" });

interface ResultCardProps {
  stay: Stay;
  parsed: ParsedQuery;
}

export function ResultCard({ stay, parsed }: ResultCardProps) {
  const [isFav, toggleFav] = useFavorite(stay._id);
  const tags = matchTags(stay, parsed);
  const imageUrl = stay.photos?.[0]?.asset?.url
    ? `${stay.photos[0].asset.url}?w=600&auto=format`
    : "";

  return (
    <View className="flex-row gap-4 rounded-xl bg-surface p-3 shadow-card">
      <StyledImage
        source={{ uri: imageUrl }}
        contentFit="cover"
        transition={200}
        className="h-39 w-35 rounded-lg bg-surface-muted"
        accessibilityLabel={`${stay.title}, ${stay.city}`}
      />
      <View className="flex-1 gap-2">
        <View className="flex-row items-start gap-2">
          <Text variant="title" numberOfLines={2} className="flex-1">
            {stay.title}
          </Text>
          <PressableScale
            onPress={() => {
              tapSelection();
              toggleFav();
            }}
            accessibilityRole="button"
            accessibilityLabel={isFav ? `Remove ${stay.title} from saved` : `Save ${stay.title}`}
            accessibilityState={{ selected: isFav }}
            className="size-11 items-center justify-center rounded-full bg-surface-muted"
          >
            <Icon
              name={isFav ? rowIcons.heartFill : rowIcons.heart}
              size={22}
              tone={isFav ? "danger" : "ink"}
            />
          </PressableScale>
        </View>

        <View className="flex-row items-center gap-1.5">
          <Icon name={rowIcons.pin} size={18} tone="subtle" />
          <Text tone="muted" numberOfLines={1} className="flex-1">
            {stay.city}, {stay.region}
          </Text>
        </View>

        <View className="flex-row items-center gap-1.5">
          <StarIcon size={18} />
          <Text variant="subtitle">{stay.rating.toFixed(2)}</Text>
          <Text tone="muted">({stay.reviewCount})</Text>
        </View>

        {tags.length > 0 ? (
          <View className="flex-row flex-wrap gap-2">
            {tags.map((tag) => (
              <View
                key={tag.label}
                className="h-8 flex-row items-center gap-1.5 rounded-full bg-surface-muted px-3"
              >
                <Icon name={tag.icon} size={16} />
                <Text variant="footnote">{tag.label}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <Text variant="title">
          ${stay.pricePerNight}
          <Text tone="muted"> / night</Text>
        </Text>
      </View>
    </View>
  );
}
