import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, type PressableProps } from "react-native";

import { cn } from "@/lib/cn";

import { Text } from "./text";

const variants = {
  primary: { container: "bg-primary", text: "button" },
  secondary: { container: "border border-border bg-surface", text: "buttonSecondary" },
} as const;

const sizes = {
  md: "h-14 px-6",
  sm: "h-10 px-4",
} as const;

type Props = Omit<PressableProps, "children" | "disabled"> & {
  title: string;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  /** Leading slot, e.g. a logo. */
  icon?: ReactNode;
  /** Trailing slot, e.g. an arrow. */
  trailingIcon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
};

export function Button({
  title,
  variant = "primary",
  size = "md",
  icon,
  trailingIcon,
  loading,
  disabled,
  className,
  ...props
}: Props) {
  const inactive = !!(disabled || loading);

  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      // The spinner replaces the visible text only; keep the label for screen readers.
      accessibilityLabel={title}
      accessibilityState={{ disabled: inactive, busy: !!loading }}
      disabled={inactive}
      className={cn(
        "flex-row items-center justify-center gap-2 rounded-full",
        sizes[size],
        variants[variant].container,
        inactive ? "opacity-40" : "active:opacity-70",
        className,
      )}
    >
      {loading ? (
        <ActivityIndicator className="text-ink" />
      ) : (
        <>
          {icon}
          <Text variant={variants[variant].text}>{title}</Text>
          {trailingIcon}
        </>
      )}
    </Pressable>
  );
}
