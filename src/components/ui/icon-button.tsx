import { Pressable, type PressableProps } from "react-native";

import { cn } from "@/lib/cn";

import { Icon, type IconName } from "./icon";
import type { Tone } from "./tones";

const variants = {
  default: "bg-surface-muted",
  surface: "bg-surface", // e.g. the heart on a listing photo
  // No fill: for controls inside another surface (field accessory, stepper).
  ghost: "",
} as const;

const sizes = {
  md: { box: "size-14", icon: 24 },
  sm: { box: "size-9", icon: 18 },
} as const;

type Props = Omit<PressableProps, "children" | "disabled" | "accessibilityLabel"> & {
  name: IconName;
  /** Required: icon-only controls have no text for screen readers. */
  accessibilityLabel: string;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  tone?: Tone;
  disabled?: boolean;
};

export function IconButton({
  name,
  variant = "default",
  size = "md",
  tone = "ink",
  disabled,
  className,
  ...props
}: Props) {
  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      className={cn(
        "items-center justify-center rounded-full",
        sizes[size].box,
        variants[variant],
        disabled ? "opacity-40" : "active:opacity-70",
        className,
      )}
    >
      <Icon name={name} size={sizes[size].icon} tone={tone} />
    </Pressable>
  );
}
