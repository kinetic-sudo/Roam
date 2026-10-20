import { View } from "react-native";

import { cn } from "@/lib/cn";

import { Icon, type IconName } from "./icon";
import { IconButton } from "./icon-button";
import { Text } from "./text";
import type { Tone } from "./tones";

const tones = {
  success: {
    box: "bg-success-soft",
    dot: "bg-success",
    text: "success",
    icon: { ios: "checkmark", android: "check", web: "check" },
  },
  danger: {
    box: "bg-danger-soft",
    dot: "bg-danger",
    text: "danger",
    icon: { ios: "exclamationmark", android: "priority_high", web: "priority_high" },
  },
} as const satisfies Record<string, { box: string; dot: string; text: Tone; icon: IconName }>;

type Props = {
  message: string;
  tone?: keyof typeof tones;
  /** Shows a ✕ button when provided. */
  onDismiss?: () => void;
  className?: string;
};

export function Alert({ message, tone = "success", onDismiss, className }: Props) {
  const t = tones[tone];
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      className={cn(
        "min-h-12 flex-row items-center gap-3 rounded-md py-2 pl-3 pr-2 corner-squircle",
        t.box,
        className,
      )}
    >
      <View className={cn("size-6 items-center justify-center rounded-full", t.dot)}>
        <Icon name={t.icon} size={14} tone="inverse" weight="bold" />
      </View>
      <Text variant="caption" tone={t.text} className="flex-1">
        {message}
      </Text>
      {onDismiss ? (
        <IconButton
          variant="ghost"
          size="sm"
          tone={t.text}
          name={{ ios: "xmark", android: "close", web: "close" }}
          accessibilityLabel="Dismiss"
          onPress={onDismiss}
        />
      ) : null}
    </View>
  );
}
