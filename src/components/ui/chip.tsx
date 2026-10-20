import type { ReactNode } from "react";
import { Pressable, type PressableProps } from "react-native";

import { cn } from "@/lib/cn";

import { Text } from "./text";

const sizes = {
  md: { box: "h-12 px-5", text: "label" },
  sm: { box: "h-11 gap-2 px-4", text: "footnote" },
} as const;

// Selected border matches the fill so the chip doesn't change size.
const selectedTones = {
  lavender: "border-lavender bg-lavender",
  primary: "border-primary bg-primary",
} as const;

type Props = Omit<PressableProps, "children"> & {
  label: string;
  selected?: boolean;
  tone?: keyof typeof selectedTones;
  size?: keyof typeof sizes;
  /** Leading slot (small size), usually an <Icon />. */
  icon?: ReactNode;
};

export function Chip({
  label,
  selected = false,
  tone = "lavender",
  size = "md",
  icon,
  className,
  ...props
}: Props) {
  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: !!props.disabled }}
      className={cn(
        "flex-row items-center justify-center rounded-full border active:opacity-70",
        sizes[size].box,
        selected ? selectedTones[tone] : "border-border bg-surface",
        className,
      )}
    >
      {icon}
      <Text variant={sizes[size].text}>{label}</Text>
    </Pressable>
  );
}
