import { ScrollView } from "react-native";

import { PressableScale, Text } from "@/components/ui";
import { TOPICS, type TopicKey } from "@/lib/ask";

/** The topic chips: the same horizontal row as the Search chips, never selected. A tap sends the topic's question. */
export function TopicChips({ onAsk }: { onAsk: (topic: TopicKey) => void }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      className="grow-0"
      contentContainerClassName="gap-2.5 px-5"
      accessibilityLabel="Topics"
    >
      {TOPICS.map((t) => (
        <PressableScale
          key={t.key}
          onPress={() => onAsk(t.key)}
          accessibilityRole="button"
          accessibilityLabel={t.label}
          accessibilityHint={`Asks: ${t.question}`}
          className="h-9 items-center justify-center rounded-full bg-surface-muted px-4"
        >
          <Text variant="label">{t.label}</Text>
        </PressableScale>
      ))}
    </ScrollView>
  );
}
