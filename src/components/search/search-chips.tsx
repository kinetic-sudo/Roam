import { useMemo } from "react";
import { ScrollView } from "react-native";

import { PressableScale, Text } from "@/components/ui";
import { cn } from "@/lib/cn";
import { tapSelection } from "@/lib/haptics";
import type { SearchIntent } from "@/lib/search/intent";
import { chipsFor, hasChip, type SearchChip as Chip } from "@/lib/search/query";

function SearchChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <PressableScale
      transitionColors
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      className={cn("h-9 items-center justify-center rounded-full px-4", selected ? "bg-lavender" : "bg-surface-muted")}
    >
      <Text variant="label">{label}</Text>
    </PressableScale>
  );
}

type Props = {
  /** How the server read the sentence: decides which chips exist and their order. */
  base: SearchIntent;
  /** The intent with the guest's toggles applied: decides which chips are selected. */
  current: SearchIntent;
  onToggle: (chip: Chip) => void;
};

/** Understood constraints first (selected), then up to four suggestions. Tapping toggles and re-runs the search. */
export function SearchChips({ base, current, onToggle }: Props) {
  const chips = useMemo(() => chipsFor(base), [base]);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      className="-mx-4 mt-3 grow-0"
      contentContainerClassName="gap-2.5 px-4"
      accessibilityLabel="Search filters"
    >
      {chips.map((chip) => {
        const selected = hasChip(current, chip);
        return (
          <SearchChip
            key={chip.id}
            label={chip.label}
            selected={selected}
            onPress={() => {
              if (!selected) tapSelection(); // a chip being switched on
              onToggle(chip);
            }}
          />
        );
      })}
    </ScrollView>
  );
}