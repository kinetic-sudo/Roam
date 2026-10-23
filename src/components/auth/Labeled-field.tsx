import { useRef, useState, type Ref } from "react";
import { Pressable, TextInput, View, type TextInputProps } from "react-native";

import { Icon, Text, type IconName } from "@/components/ui";
import { cn } from "@/lib/cn";

import { authIcons } from "./icons";

type Props = Omit<TextInputProps, "style" | "secureTextEntry"> & {
  label: string;
  icon: IconName;
  invalid?: boolean;
  /** Masks the text and adds the show/hide toggle. */
  secure?: boolean;
  ref?: Ref<TextInput>;
};

/** Two-line field from the auth design: icon, label, then the input. */
export function LabeledField({ label, icon, invalid, secure, ref, onFocus, onBlur, ...props }: Props) {
  const inner = useRef<TextInput | null>(null);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secure);

  const setRefs = (node: TextInput | null) => {
    inner.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) (ref as { current: TextInput | null }).current = node;
  };

  return (
    <Pressable
      onPress={() => inner.current?.focus()}
      accessible={false}
      className={cn(
        "h-16 flex-row items-center gap-7 rounded-lg border px-5 corner-squircle",
        invalid ? "border-danger bg-danger-soft" : focused ? "border-lavender bg-lavender-soft" : "border-transparent bg-surface-muted",
      )}
    >
      <Icon name={icon} size={24} />
      <View className="flex-1 justify-center">
        <Text variant="label">{label}</Text>
        <TextInput
          {...props}
          ref={setRefs}
          accessibilityLabel={label}
          secureTextEntry={hidden}
          placeholderTextColorClassName="accent-ink-subtle"
          className="h-6 p-0 font-jakarta text-input text-ink"
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
        />
      </View>
      {secure ? (
        <Pressable
          onPress={() => setHidden((h) => !h)}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={hidden ? "Show password" : "Hide password"}
        >
          <Icon name={hidden ? authIcons.eyeOff : authIcons.eye} size={24} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}