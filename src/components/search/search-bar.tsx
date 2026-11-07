import type { Ref } from "react";
import { TextInput, View } from "react-native";

import { Icon } from "@/components/ui";

import { searchIcons } from "./search-icons";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  /** Return key. An empty string is allowed: it clears the search and shows every stay. */
  onSubmit: (text: string) => void;
  ref?: Ref<TextInput>;
};

/** The grey search bar: search icon, the query, and the (not yet working) filters icon. */
export function SearchBar({ value, onChangeText, onSubmit, ref }: Props) {
  return (
    <View className="h-13 flex-1 flex-row items-center gap-3 rounded-full bg-surface-muted pl-5 pr-4">
      <Icon name={searchIcons.search} size={24} />
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        placeholder="Search stays"
        placeholderTextColorClassName="accent-ink-subtle"
        returnKeyType="search"
        submitBehavior="blurAndSubmit"
        onSubmitEditing={() => onSubmit(value.trim())}
        autoCorrect={false}
        accessibilityLabel="Search stays"
        // text-input has no line height on purpose: a line height makes iOS draw a second line in a single-line input.
        className="h-full flex-1 font-jakarta-medium text-input text-ink"
      />
      {/* Shown, not wired: it opens a filters sheet in a later plan. */}
      <View accessible accessibilityRole="button" accessibilityLabel="Filters" accessibilityState={{ disabled: true }}>
        <Icon name={searchIcons.filters} size={24} />
      </View>
    </View>
  );
}