import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { useCssElement, type StyledConfiguration } from "react-native-css";

import { cn } from "@/lib/cn";

import { toneClass, type Tone } from "./tones";

/** `{ ios: SF Symbol, android: Material symbol, web: Material symbol }` */
export type IconName = SymbolViewProps["name"];

// The tone's text color becomes the symbol's tintColor.
const mapping = {
  className: {
    target: false,
    nativeStyleMapping: { color: "tintColor" },
  },
} satisfies StyledConfiguration<typeof SymbolView>;

type Props = Omit<SymbolViewProps, "tintColor"> & {
  tone?: Tone;
  className?: string;
};

export function Icon({ tone = "ink", size = 24, weight = "medium", className, ...props }: Props) {
  return useCssElement(
    SymbolView,
    { ...props, size, weight, className: cn(toneClass[tone], className) },
    mapping,
  );
}
