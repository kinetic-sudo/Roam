import { useState, type ReactNode } from "react";
import { Pressable, type PressableProps } from "react-native";
import { styled } from "react-native-css";
import Animated, { useReducedMotion } from "react-native-reanimated";

import { css, press } from "@/theme";

const AnimatedView = styled(Animated.View, { className: "style" });

type Props = Omit<PressableProps, "style" | "children"> & {
  /** Layout and look of the visible box (it is the box that scales). */
  className?: string;
  children: ReactNode;
  /** Also fade the background colour when `className` swaps it (selected chips). */
  transitionColors?: boolean;
};

/**
 * Press feedback for every tappable thing: scale 0.97 in 120 ms on press-in, back on press-out.
 * A CSS transition on `transform`, so it runs on the UI thread with no shared value.
 * Reduced motion drops the scale; colour fades stay.
 */
export function PressableScale({
  className,
  children,
  transitionColors,
  hitSlop = 8,
  pressRetentionOffset = 16,
  onPressIn,
  onPressOut,
  ...props
}: Props) {
  const [pressed, setPressed] = useState(false);
  const reduced = useReducedMotion();
  const scale = pressed && !reduced ? press.scale : 1;

  return (
    <Pressable
      {...props}
      hitSlop={hitSlop}
      pressRetentionOffset={pressRetentionOffset}
      onPressIn={(e) => {
        setPressed(true);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        onPressOut?.(e);
      }}
    >
      <AnimatedView
        className={className}
        style={{
          transform: [{ scale }],
          transitionProperty: transitionColors ? ["transform", "backgroundColor"] : "transform",
          transitionDuration: transitionColors ? [press.durationCss, press.colorDurationCss] : press.durationCss,
          transitionTimingFunction: css.easeOut,
        }}
      >
        {children}
      </AnimatedView>
    </Pressable>
  );
}