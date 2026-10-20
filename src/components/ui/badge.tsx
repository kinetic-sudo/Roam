import type { ReactNode } from "react";
import { View } from "react-native";

import { cn } from "@/lib/cn";

import { Text } from "./text";
import type { Tone } from "./tones";

const tones = {
  primary: { box: "bg-primary-soft", text: "ink" },
  success: { box: "bg-success-soft", text: "success" },
  promo: { box: "bg-promo-soft", text: "ink" },
  info: { box: "bg-info-soft", text: "info" },
} as const satisfies Record<string, { box: string; text: Tone }>;

type Props = {
  label: string;
  tone?: keyof typeof tones;
  /** Leading slot, usually a small <Icon />. */
  icon?: ReactNode;
  className?: string;
};

/** Static tag. For something tappable use Chip. */
export function Badge({ label, tone = "primary", icon, className }: Props) {
  return (
    <View
      className={cn(
        "h-9 flex-row items-center gap-2 self-start rounded-full px-4",
        tones[tone].box,
        className,
      )}
    >
      {icon}
      <Text variant="caption" tone={tones[tone].text}>
        {label}
      </Text>
    </View>
  );
}
