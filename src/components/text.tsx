import { Text as RNText, type TextProps } from "react-native";

// Class strings are written out in full so Tailwind can detect them.
const variants = {
  display: "font-brand-bold text-display",
  heading: "font-brand-bold text-heading",
  body: "font-brand text-body",
  caption: "font-brand-medium text-caption",
  button: "font-brand-medium text-button",
} as const;

const tones = {
  default: "text-foreground",
  muted: "text-muted-foreground",
  inverse: "text-surface",
} as const;

export type TextVariant = keyof typeof variants;
export type TextTone = keyof typeof tones;

type Props = TextProps & {
  variant?: TextVariant;
  /** Defaults to "muted" for caption, "default" otherwise. */
  tone?: TextTone;
};

/**
 * The only way screens render text: size, weight and color come from the
 * theme. `className` is for layout (margins, flex, text-center), not identity.
 */
export function Text({ variant = "body", tone, className, ...props }: Props) {
  const resolvedTone = tone ?? (variant === "caption" ? "muted" : "default");
  return (
    <RNText
      className={[variants[variant], tones[resolvedTone], className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}