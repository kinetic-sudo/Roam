import { ActivityIndicator, Pressable, type PressableProps } from "react-native";

import { Text } from "./text";

const variants = {
  primary: "bg-primary",
  secondary: "border border-border bg-surface",
} as const;

const sizes = {
  md: "h-12 px-6",
  lg: "h-14 px-8",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

type Props = Omit<PressableProps, "children" | "disabled"> & {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
};

export function Button({
  title,
  variant = "primary",
  size = "lg",
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
      // Keep the label while loading: the spinner replaces the visible text only.
      accessibilityLabel={title}
      accessibilityState={{ disabled: inactive, busy: !!loading }}
      disabled={inactive}
      className={[
        "flex-row items-center justify-center rounded-full",
        sizes[size],
        variants[variant],
        inactive ? "opacity-40" : "active:opacity-70",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {loading ? (
        <ActivityIndicator className="text-foreground" />
      ) : (
        <Text variant="button">{title}</Text>
      )}
    </Pressable>
  );
}