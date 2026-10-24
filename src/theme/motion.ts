import { Easing } from "react-native-reanimated";

/** Durations (ms). Mobile UI motion stays under 300 ms. */
export const motion = {
  fast: 150, // state feedback: press, toggle, chip colour
  base: 250, // element transitions: enter/exit
  slow: 400, // large surfaces: sheets, screens
} as const;

/** Default settle, no overshoot (Reanimated `withSpring`, Apple's duration + dampingRatio form). */
export const spring = { duration: 400, dampingRatio: 1 } as const;

/** Strong ease-out for anything entering/leaving. */
export const easeOut = Easing.bezier(0.23, 1, 0.32, 1);
/** Ease-in-out for things moving on screen (list reflow). */
export const easeInOut = Easing.bezier(0.77, 0, 0.175, 1);

/** Same curve as a CSS string, for Reanimated CSS transitions. */
export const css = { easeOut: "cubic-bezier(0.23, 1, 0.32, 1)" } as const;

/** Press feedback: near-imperceptible by design (it happens tens of times a day). */
export const press = {
  scale: 0.97,
  duration: 120,
  durationCss: "120ms",
  colorDurationCss: "150ms",
} as const;

/** Per-item delay (ms) for result lists. 30–80 ms reads as a stagger. */
export const stagger = 40;
