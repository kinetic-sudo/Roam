import { useState } from "react";
import { View } from "react-native";
import Animated, { FadeIn, FadeOut, ReduceMotion } from "react-native-reanimated";

import { Icon, PressableScale, Text } from "@/components/ui";
import { tapSelection } from "@/lib/haptics";
import type { SortKey } from "@/lib/search/search";

import { rowIcons } from "./row-icons";

const OPTIONS: { key: SortKey; label: string }[] = [
  { key: "best", label: "Best match" },
  { key: "price", label: "Price: low to high" },
  { key: "rating", label: "Top rated" },
];

const IN = FadeIn.duration(150).reduceMotion(ReduceMotion.System);
const OUT = FadeOut.duration(100).reduceMotion(ReduceMotion.System);

/** "2 stays" on the left, "Sort by Best match ⌄" on the right; tapping opens the three options. */
export function SortControl({ count, value, onChange }: { count: number; value: SortKey; onChange: (k: SortKey) => void }) {
  const [open, setOpen] = useState(false);
  const current = OPTIONS.find((o) => o.key === value) ?? OPTIONS[0];

  return (
    <View className="mt-5">
      <View className="flex-row items-center justify-between">
        <Text>
          {count} {count === 1 ? "stay" : "stays"}
        </Text>
        <PressableScale
          onPress={() => setOpen((o) => !o)}
          accessibilityRole="button"
          accessibilityLabel={`Sort by ${current.label}`}
          accessibilityState={{ expanded: open }}
          className="flex-row items-center gap-1.5"
        >
          <Text tone="muted">Sort by</Text>
          <Text variant="subtitle">{current.label}</Text>
          <Icon name={open ? rowIcons.chevronUp : rowIcons.chevronDown} size={16} />
        </PressableScale>
      </View>

      {open ? (
        <Animated.View entering={IN} exiting={OUT} className="mt-3 rounded-lg bg-surface-muted p-1">
          {OPTIONS.map((o) => {
            const selected = o.key === value;
            return (
              <PressableScale
                key={o.key}
                onPress={() => {
                  if (!selected) tapSelection();
                  onChange(o.key);
                  setOpen(false);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={o.label}
                className="h-11 flex-row items-center justify-between rounded-md px-4"
              >
                <Text variant={selected ? "subtitle" : "label"}>{o.label}</Text>
                {selected ? <Icon name={rowIcons.check} size={18} /> : null}
              </PressableScale>
            );
          })}
        </Animated.View>
      ) : null}
    </View>
  );
}