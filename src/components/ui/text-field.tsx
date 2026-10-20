import { useState, type ReactNode } from "react";
import { TextInput, View, type TextInputProps } from "react-native";

import { cn } from "@/lib/cn";

import { IconButton } from "./icon-button";

type Props = Omit<TextInputProps, "secureTextEntry"> & {
  /** Leading slot, usually an <Icon />. */
  icon?: ReactNode;
  /** Trailing slot, e.g. a filter button. Replaced by the eye toggle when `secure`. */
  accessory?: ReactNode;
  /** Password field with a show/hide eye toggle. */
  secure?: boolean;
};

export function TextField({
  icon,
  accessory,
  secure,
  className,
  onFocus,
  onBlur,
  accessibilityLabel,
  placeholder,
  ...props
}: Props) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);

  return (
    <View
      className={cn(
        "h-14 flex-row items-center gap-3 rounded-lg px-4 corner-squircle",
        focused ? "border-2 border-lavender bg-lavender-soft" : "border border-border/60 bg-surface-muted",
        className,
      )}
    >
      {icon}
      <TextInput
        {...props}
        placeholder={placeholder}
        accessibilityLabel={accessibilityLabel ?? placeholder}
        secureTextEntry={secure ? hidden : false}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        className="flex-1 font-jakarta text-body text-ink placeholder:text-ink-subtle"
      />
      {secure ? (
        <IconButton
          variant="ghost"
          size="sm"
          name={hidden ? { ios: "eye", android: "visibility", web: "visibility" } : { ios: "eye.slash", android: "visibility_off", web: "visibility_off" }}
          accessibilityLabel={hidden ? "Show password" : "Hide password"}
          onPress={() => setHidden((h) => !h)}
        />
      ) : (
        accessory
      )}
    </View>
  );
}
