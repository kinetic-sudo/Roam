import { View } from "react-native";

import { tagIcons } from "@/components/search/icons";
import { Icon, Text } from "@/components/ui";
import { EMPTY_QUERY, stayTags } from "@/lib/search/query";
import type { StayDetails } from "@/lib/stays";

/**
 * Four amenity highlights (the same tags and glyphs as Search), then the divider under them.
 * Fewer than four stay left-aligned at a quarter width each. With none, the row and its divider are hidden.
 */
export function AmenityRow({ stay }: { stay: Pick<StayDetails, "amenities" | "houseRules"> }) {
  const tags = stayTags(stay, EMPTY_QUERY, 4);
  if (tags.length === 0) return null;

  return (
    <>
      <View className="mt-5 flex-row">
        {tags.map((t) => (
          <View key={t.key} className="w-1/4 items-center gap-2.5">
            <Icon name={tagIcons[t.key]} size={28} />
            <Text variant="caption" numberOfLines={1}>
              {t.label}
            </Text>
          </View>
        ))}
      </View>
      <View className="mt-5 h-px bg-border" />
    </>
  );
}
