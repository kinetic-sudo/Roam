import { Pressable, View } from "react-native";

import { cn } from "@/lib/cn";

import { Icon, type IconName } from "./icon";
import { Text } from "./text";

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
  icon?: IconName;
};

type Props<T extends string> = {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export function SegmentedControl<T extends string>({ options, value, onChange, className }: Props<T>) {
  return (
    <View
      accessibilityRole="tablist"
      className={cn("h-12 flex-row items-center rounded-full bg-surface-muted p-1", className)}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            className={cn(
              "h-full flex-1 flex-row items-center justify-center gap-2 rounded-full active:opacity-70",
              selected && "bg-ink",
            )}
          >
            {option.icon ? (
              <Icon name={option.icon} size={20} tone={selected ? "inverse" : "ink"} />
            ) : null}
            <Text variant="label" tone={selected ? "inverse" : "ink"}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
