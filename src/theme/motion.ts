/** Durations (ms) and the shared spring, so animations across the app feel related. */
export const motion = {
  fast: 150, // state feedback: press, toggle
  base: 250, // element transitions: enter/exit
  slow: 400, // large surfaces: sheets, screens
} as const;

/** One shared spring config (Reanimated `withSpring`). */
export const spring = {
  damping: 20,
  stiffness: 220,
  mass: 1,
} as const;
