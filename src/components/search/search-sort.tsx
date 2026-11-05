import { MenuView, type NativeActionEvent } from "@expo/ui/community/menu";
import { View } from "react-native";

import { Icon, Text } from "@/components/ui";
import { SORT_OPTIONS, type SortOption } from "@/lib/search/query";

import { searchIcons } from "./icons";

/**
 * "Sort by Best match ⌄", opening a native menu (SwiftUI Menu on iOS, a Compose DropdownMenu on Android).
 * One file for both platforms: `MenuView` from @expo/ui renders each natively and marks the current option.
 */
export function SortMenu({ value, onChange }: { value: SortOption; onChange: (sort: SortOption) => void }) {
  const current = SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0];

  return (
    <MenuView
      actions={SORT_OPTIONS.map((o) => ({ id: o.value, title: o.label, state: o.value === value ? "on" : "off" }))}
      onPressAction={({ nativeEvent }: NativeActionEvent) => onChange(nativeEvent.event as SortOption)}
    >
      <View accessible accessibilityRole="button" accessibilityLabel={`Sort by ${current.label}`} className="flex-row items-center gap-1">
        <Text variant="lead" tone="muted">
          Sort by
        </Text>
        <Text variant="subtitle">{current.label}</Text>
        <Icon name={searchIcons.chevronDown} size={18} />
      </View>
    </MenuView>
  );
}