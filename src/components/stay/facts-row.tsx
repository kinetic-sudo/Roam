import { View } from "react-native";

import { Text } from "@/components/ui";

/** "6 guests · 3 bedrooms · 4 beds · 2.5 baths" as soft pills that wrap onto a second line when they must. */
export function FactsRow({ facts }: { facts: string[] }) {
  if (facts.length === 0) return null;
  return (
    <View className="mt-4 flex-row flex-wrap gap-2">
      {facts.map((f) => (
        <View key={f} className="h-9 justify-center rounded-full bg-surface-muted px-3.5">
          <Text variant="label">{f}</Text>
        </View>
      ))}
    </View>
  );
}
