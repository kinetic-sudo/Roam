import type { ComponentType } from "react";
import { Switch, type SwitchProps } from "react-native";
import { useCssElement } from "react-native-css";

// Track and thumb colors come from token classes, mapped onto Switch's color props.
const mapping = {
  className: "style",
  trackOnClassName: {
    target: false,
    nativeStyleMapping: { backgroundColor: "trackColor.true" },
  },
  trackOffClassName: {
    target: false,
    nativeStyleMapping: { backgroundColor: "trackColor.false" },
  },
  iosTrackOffClassName: {
    target: false,
    nativeStyleMapping: { backgroundColor: "ios_backgroundColor" },
  },
  thumbClassName: {
    target: false,
    nativeStyleMapping: { backgroundColor: "thumbColor" },
  },
} as const;

// react-native-css's mapping types expand every dot-path of Switch's props and
// overflow TypeScript's union limit (TS2590). Toggle's own Props stay strict;
// only this internal call is loosely typed.
const StyledSwitch = Switch as unknown as ComponentType<Record<string, unknown>>;

type Props = Pick<SwitchProps, "value" | "onValueChange" | "disabled"> & {
  /** Spoken name, e.g. "Pet friendly". */
  accessibilityLabel: string;
  className?: string;
};

/** The native Switch (not re-implemented), with the on track in primary. */
export function Toggle({ className, ...props }: Props) {
  return useCssElement(
    StyledSwitch,
    {
      ...props,
      className,
      trackOnClassName: "bg-primary",
      trackOffClassName: "bg-border",
      iosTrackOffClassName: "bg-border",
      thumbClassName: "bg-surface",
    },
    mapping,
  );
}
