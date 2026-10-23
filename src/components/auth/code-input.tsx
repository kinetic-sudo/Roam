import { useState } from "react";
import { TextInput, View } from "react-native";

import { Text } from "@/components/ui";
import { cn } from "@/lib/cn";

type Props = {
  value: string;
  onChangeText: (digits: string) => void;
  invalid?: boolean;
  editable?: boolean;
};

const LENGTH = 6;

/** Six cells drawn over one invisible TextInput, so paste and one-time-code autofill work. */
export function CodeInput({ value, onChangeText, invalid, editable = true }: Props) {
  const [focused, setFocused] = useState(true);

  return (
    <View>
      <View className="flex-row gap-2.5">
        {Array.from({ length: LENGTH }, (_, i) => {
          const active = focused && i === Math.min(value.length, LENGTH - 1);
          return (
            <View
              key={i}
              className={cn(
                "h-16 flex-1 items-center justify-center rounded-lg border-2 corner-squircle",
                invalid ? "border-danger bg-danger-soft" : active ? "border-lavender bg-lavender-soft" : "border-transparent bg-surface-muted",
              )}
            >
              <Text variant="title">{value[i] ?? ""}</Text>
            </View>
          );
        })}
      </View>
      <TextInput
        value={value}
        onChangeText={(t) => onChangeText(t.replace(/\D/g, "").slice(0, LENGTH))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={LENGTH}
        editable={editable}
        autoFocus
        caretHidden
        accessibilityLabel="6-digit verification code"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="absolute inset-0 opacity-0"
      />
    </View>
  );
}