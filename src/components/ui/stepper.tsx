import { View } from "react-native";

import { cn } from "@/lib/cn";

import { IconButton } from "./icon-button";
import { Text } from "./text";

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** Spoken name, e.g. "Guests". */
  accessibilityLabel: string;
  className?: string;
};

export function Stepper({
  value,
  onChange,
  min = 0,
  max = Number.POSITIVE_INFINITY,
  accessibilityLabel,
  className,
}: Props) {
  const canDecrement = value > min;
  const canIncrement = value < max;

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{
        now: value,
        min,
        ...(Number.isFinite(max) ? { max } : {}),
      }}
      accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === "increment" && canIncrement) onChange(value + 1);
        if (e.nativeEvent.actionName === "decrement" && canDecrement) onChange(value - 1);
      }}
      className={cn(
        "h-12 flex-row items-center gap-1 self-start rounded-full border border-border bg-surface px-1",
        className,
      )}
    >
      <IconButton
        variant="ghost"
        size="sm"
        name={{ ios: "minus", android: "remove", web: "remove" }}
        accessibilityLabel="Decrease"
        disabled={!canDecrement}
        onPress={() => onChange(value - 1)}
      />
      <Text variant="label" className="min-w-6 text-center">
        {value}
      </Text>
      <IconButton
        variant="ghost"
        size="sm"
        name={{ ios: "plus", android: "add", web: "add" }}
        accessibilityLabel="Increase"
        disabled={!canIncrement}
        onPress={() => onChange(value + 1)}
      />
    </View>
  );
}
