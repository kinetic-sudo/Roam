import { useMemo } from "react";
import { ScrollView } from "react-native";

import { PressableScale, Text } from "@/components/ui";
import { cn } from "@/lib/cn";
import { tapSelection } from "@/lib/haptics";
import type { ParsedQuery } from "@/lib/search/parse";
import { chipsFor, isChipOn, type SearchChip as Chip } from "@/lib/search/query";

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
  /** The submitted query: decides which chips exist and their order. */
  base: ParsedQuery;
  /** The query with the guest's toggles applied: decides which chips are selected. */
  current: ParsedQuery;
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
        const selected = isChipOn(current, chip);
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