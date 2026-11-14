import { View } from "react-native";

import { StarIcon } from "@/components/stays/";
import { Text } from "@/components/ui";

/** Star + rating over the review count, in a soft grey box. */
export function RatingBox({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  return (
    <View
      accessible
      accessibilityLabel={`Rated ${rating.toFixed(1)} from ${reviewCount} reviews`}
      className="items-center rounded-lg bg-surface-muted px-4 py-2.5"
    >
      <View className="flex-row items-center gap-1">
        <StarIcon size={20} />
        <Text variant="title">{rating.toFixed(1)}</Text>
      </View>
      <Text variant="lead" tone="subtle">
        ({reviewCount})
      </Text>
    </View>
  );
}
