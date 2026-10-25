import { View } from "react-native";

import { stayIcons } from "@/components/stays/icons";
import { Icon, PressableScale, Text, type IconName } from "@/components/ui";
import type { PropertyType } from "@/data/properties";
import { cn } from "@/lib/cn";
import { tapSelection } from "@/lib/haptics";

export type Category = "all" | PropertyType;

const CHIPS: { id: Category; label: string; icon: IconName }[] = [
  { id: "all", label: "All Stays", icon: stayIcons.homeFill },
  { id: "cabin", label: "Cabins", icon: stayIcons.cabin },
  { id: "beach", label: "Beach", icon: stayIcons.beach },
  { id: "city", label: "City", icon: stayIcons.city },
  { id: "villa", label: "Villas", icon: stayIcons.villa },
];

export function CategoryChips({ value, onChange }: { value: Category; onChange: (c: Category) => void }) {
  return (
    <View className="flex-row flex-wrap gap-2" accessibilityRole="tablist">
      {CHIPS.map((chip) => {
        const selected = chip.id === value;
        return (
          <PressableScale
            key={chip.id}
            transitionColors
            accessibilityRole="button"
            accessibilityLabel={chip.label}
            accessibilityState={{ selected }}
            onPress={() => {
              if (selected) return;
              tapSelection(); // same frame as the colour change
              onChange(chip.id);
            }}
            className={cn("h-12 flex-row items-center gap-2 rounded-full px-4", selected ? "bg-primary" : "bg-surface-muted")}
          >
            <Icon name={chip.icon} size={22} />
            <Text variant="label">{chip.label}</Text>
          </PressableScale>
        );
      })}
    </View>
  );
}