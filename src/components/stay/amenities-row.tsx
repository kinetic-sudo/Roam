import { View } from "react-native";

import { tagIcons } from "@/components/search/icons";
import { Icon, Text } from "@/components/ui";
import { EMPTY_INTENT, stayTags } from "@/lib/search/query";
import type { StayDetails } from "@/lib/stays";

import { HotTubIcon } from "./hot-tub-icon";

/**
 * Four amenity highlights, each glyph on a soft rounded tile, then the divider under them.
 * Fewer than four stay left-aligned at a quarter width each. With none, the row and its divider are hidden.
 */
export function AmenityRow({ stay }: { stay: Pick<StayDetails, "amenities" | "houseRules"> }) {
  const tags = stayTags(stay, EMPTY_INTENT, 4);
  if (tags.length === 0) return null;

  return (
    <>
      <View className="mt-6 flex-row">
        {tags.map((t) => (
          <View key={t.key} className="w-1/4 items-center gap-2.5">
            <View className="size-15 items-center justify-center rounded-lg bg-surface-muted corner-squircle">
              {t.key === "hotTub" ? <HotTubIcon size={28} /> : <Icon name={tagIcons[t.key]} size={28} />}
            </View>
            <Text variant="caption" numberOfLines={1}>
              {t.label}
            </Text>
          </View>
        ))}
      </View>
      <View className="mt-6 h-px bg-border" />
    </>
  );
}
