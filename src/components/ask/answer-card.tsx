import { useRouter } from "expo-router";
import { View } from "react-native";

import { stayIcons } from "@/components/stays/icon";
import { Icon, PressableScale, Text } from "@/components/ui";
import { track } from "@/lib/analytics";
import type { AnswerCard as Card } from "@/lib/ask";
import { cn } from "@/lib/cn";

const SOURCE_ICON = { home: stayIcons.homeFill, policy: stayIcons.policy } as const;

/**
 * One answer: the source, a title, the text word for word, and a link to the full policy (or to all of them).
 * The "no answer" card has no source and no link, and sits on the grey fill.
 */
export function AnswerCard({ card, slug }: { card: Card; slug: string }) {
  const router = useRouter();

  const open = () => {
    track({ name: "stay_policies_opened", props: { slug, from: "ask_answer" } });
    router.push({
      pathname: "/stay/[slug]/policies",
      params: card.link?.section ? { slug, section: card.link.section } : { slug },
    });
  };

  return (
    <View className={cn("gap-2 rounded-lg p-4", card.source ? "bg-lavender-soft" : "bg-surface-muted")}>
      {card.source ? (
        <View className="flex-row items-center gap-1.5">
          <Icon name={SOURCE_ICON[card.source.icon]} size={16} tone="accent" />
          <Text variant="footnote" tone="accent">
            {card.source.label}
          </Text>
        </View>
      ) : null}

      <Text variant="subtitle">{card.title}</Text>

      <View className="gap-1">
        {card.lines.map((line, i) => (
          <Text key={`${i}-${line}`} variant="body">
            {line}
          </Text>
        ))}
      </View>

      {card.link ? (
        <View className="self-start">
          <PressableScale onPress={open} hitSlop={8} accessibilityRole="link" accessibilityLabel={card.link.label}>
            <Text variant="link" tone="accent">
              {card.link.label}
            </Text>
          </PressableScale>
        </View>
      ) : null}
    </View>
  );
}
