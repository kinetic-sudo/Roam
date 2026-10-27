import type { Ref } from "react";
import { TextInput, View } from "react-native";

import { Icon, PressableScale } from "@/components/ui";

import { stayIcons } from "./icons";
import { rowIcons } from "./row-icons";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  /** Return key: only called with typed text. */
  onSubmit: (text: string) => void;
  onClear: () => void;
  ref?: Ref<TextInput>;
};

/** The plain grey search field on the Search screen (Home keeps the lavender prompt bar). */
export function SearchField({ value, onChangeText, onSubmit, onClear, ref }: Props) {
  return (
    <View className="h-13 flex-1 flex-row items-center gap-3 rounded-full bg-surface-muted pl-4 pr-2">
      <Icon name={stayIcons.search} size={22} />
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        placeholder="Search stays"
        placeholderTextColorClassName="accent-ink-subtle"
        returnKeyType="search"
        submitBehavior="blurAndSubmit"
        onSubmitEditing={() => {
          if (value.trim()) onSubmit(value.trim());
        }}
        autoCorrect={false}
        accessibilityLabel="Search stays"
        // text-prompt has no line height on purpose (single-line TextInput).
        className="flex-1 font-jakarta-medium text-prompt text-ink"
      />
      {value ? (
        <PressableScale
          onPress={onClear}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          className="size-9 items-center justify-center rounded-full bg-surface"
        >
          <Icon name={rowIcons.close} size={16} />
        </PressableScale>
      ) : null}
    </View>
  );
}