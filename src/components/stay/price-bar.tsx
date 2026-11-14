import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Text } from "@/components/ui";
import { money, totalLabel } from "@/lib/stay-details";
import type { StayDetails } from "@/lib/stays";

/** pt-4 (16) + the 64 pt button. The home-indicator inset is added on top. The ScrollView pads by this much. */
export const PRICE_BAR_HEIGHT = 80;

/**
 * Fixed at the bottom: price per night and the total on the left, "Book this stay" on the right.
 * The button takes the width the price leaves, so "$1,234 total · 2 nights" never truncates.
 */
export function PriceBar({
  stay,
  onBook,
}: {
  stay: Pick<StayDetails, "pricePerNight" | "minNights" | "cleaningFee">;
  onBook: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="absolute inset-x-0 bottom-0 flex-row items-center gap-4 border-t border-border bg-surface px-5 pt-4"
      style={{ paddingBottom: insets.bottom }}
    >
      <View>
        <View className="flex-row items-baseline">
          <Text variant="heading">{money(stay.pricePerNight)}</Text>
          <Text variant="body"> / night</Text>
        </View>
        <Text variant="body" tone="subtle">
          {totalLabel(stay)}
        </Text>
      </View>
      <Button title="Book this stay" size="lg" onPress={onBook} className="flex-1" />
    </View>
  );
}
