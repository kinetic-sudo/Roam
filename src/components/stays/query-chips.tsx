import { ScrollView, View } from "react-native";

import { Text } from "@/components/ui";

/** What we understood from the search, as a swipeable row. Informational: not buttons. */
export function QueryChips({ chips }: { chips: string[] }) {
  if (chips.length === 0) return null;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="-mx-5 mt-4 grow-0"
      contentContainerClassName="gap-2 px-5"
      accessibilityLabel="Search filters"
    >
      {chips.map((c) => (
        <View key={c} className="h-11 items-center justify-center rounded-full bg-lavender px-5">
          <Text variant="label">{c}</Text>
        </View>
      ))}
    </ScrollView>
  );
}