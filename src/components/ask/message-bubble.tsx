import { View } from "react-native";

import { Text } from "@/components/ui";

/**
 * Roam's message sits on the left in grey, the guest's on the right in lavender. The margin on the far side stops
 * a long message reaching the edge (an arbitrary max-width class is not allowed).
 */
export function MessageBubble({ from, text }: { from: "roam" | "guest"; text: string }) {
  return (
    <View
      className={
        from === "roam"
          ? "mr-12 self-start rounded-lg bg-surface-muted px-4 py-3"
          : "ml-12 self-end rounded-lg bg-lavender px-4 py-3"
      }
    >
      <Text variant="body">{text}</Text>
    </View>
  );
}
