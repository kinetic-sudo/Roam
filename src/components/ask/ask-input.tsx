import { useState } from "react";
import { TextInput, View } from "react-native";

import { stayIcons } from "@/components/stays/icon";
import { Icon, IconButton } from "@/components/ui";

/**
 * The grey pill: a chat icon, the question, and a round send button. The keyboard's Send key submits too and the
 * keyboard stays open. Empty or whitespace-only text sends nothing. `onSend` gets the trimmed text; the field clears.
 */
export function AskInput({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState("");
  const trimmed = text.trim();

  const submit = () => {
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <View className="mx-5 h-13 flex-row items-center gap-3 rounded-full bg-surface-muted pl-4 pr-1.5">
      <Icon name={stayIcons.chat} size={22} />
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Ask about this stay"
        placeholderTextColorClassName="accent-ink-subtle"
        returnKeyType="send"
        submitBehavior="submit"
        onSubmitEditing={submit}
        accessibilityLabel="Ask about this stay"
        // text-input has no line height on purpose (see SearchBar).
        className="h-full flex-1 font-jakarta-medium text-input text-ink"
      />
      <IconButton
        variant="primary"
        size="send"
        name={stayIcons.arrowUp}
        accessibilityLabel="Send"
        disabled={!trimmed}
        onPress={submit}
      />
    </View>
  );
}
