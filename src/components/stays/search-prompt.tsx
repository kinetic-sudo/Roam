import type { Ref } from "react";
import { TextInput, View } from "react-native";

import { Icon, PressableScale } from "@/components/ui";

import { stayIcons } from "./icons";

export const SUGGESTION = "quiet pet friendly cabin with hot tub";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  /** Called with the text to search for. */
  onSubmit: (text: string) => void;
  /**
   * What the arrow sends when nothing is typed (Home sends the suggestion shown as the placeholder).
   * Without it, the arrow sends an empty search. The keyboard's return key only ever sends typed text.
   */
  fallback?: string;
  placeholder?: string;
  autoFocus?: boolean;
  ref?: Ref<TextInput>;
};

/** The lavender "describe your stay" bar, shared by Home and Search. */
export function SearchPrompt({ value, onChangeText, onSubmit, fallback, placeholder = SUGGESTION, autoFocus, ref }: Props) {
  const send = () => onSubmit(value.trim() || fallback || "");

  return (
    <View className="h-16 flex-row items-center gap-3 rounded-full bg-lavender pl-5 pr-2">
      <Icon name={stayIcons.sparkles} size={24} />
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColorClassName="accent-ink"
        returnKeyType="search"
        submitBehavior="blurAndSubmit"
        onSubmitEditing={() => {
          if (value.trim()) onSubmit(value.trim());
        }}
        autoFocus={autoFocus}
        autoCorrect={false}
        accessibilityLabel="Describe your stay"
        // No text-* size class on purpose: a line height makes iOS draw a second line in a single-line input.
        className="flex-1 font-jakarta-medium text-ink"
      />
      <PressableScale
        onPress={send}
        accessibilityRole="button"
        accessibilityLabel="Search"
        className="size-12 items-center justify-center rounded-full bg-surface"
      >
        <Icon name={stayIcons.arrowUpRight} size={22} />
      </PressableScale>
    </View>
  );
}