import { Text as RNText, type TextProps } from "react-native";

import { cn } from "@/lib/cn";

import { toneClass, type Tone } from "./tones";

const variants = {
  brand: "font-jakarta-extrabold text-brand",
  display: "font-jakarta-bold text-display",
  wordmark: "font-wordmark text-brand",
  wordmarkXl: "font-wordmark text-display",
  jumbo: "font-jakarta-bold text-jumbo",
  hero: "font-jakarta-extrabold text-hero",
    headline: "font-jakarta-bold text-headline",
  heading: "font-jakarta-bold text-heading",
  title: "font-jakarta-bold text-title",
  subtitle: "font-jakarta-semibold text-subtitle",
  body: "font-jakarta text-body",
  lead: "font-jakarta text-lead",
  label: "font-jakarta-medium text-label",
  button: "font-jakarta-semibold text-button",
  buttonSecondary: "font-jakarta-medium text-button",
  caption: "font-jakarta-medium text-caption",
  footnote: "font-jakarta-medium text-footnote",
} as const;

export type TextVariant = keyof typeof variants;

type Props = TextProps & {
  variant?: TextVariant;
  tone?: Tone;
};

/**
 * The only way screens render text. Size, weight and color come from the theme.
 * `className` is for layout (margins, flex, text-center), not identity.
 */
export function Text({ variant = "body", tone = "ink", className, ...props }: Props) {
  return <RNText className={cn(variants[variant], toneClass[tone], className)} {...props} />;
}
