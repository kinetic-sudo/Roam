import * as Haptics from "expo-haptics";

// One haptic per user action, in the same frame as the visual. Never the only feedback.
// Failures (no haptic engine, simulator) are ignored.

/** A choice changed: chip selection. */
export function tapSelection() {
  Haptics.selectionAsync().catch(() => {});
}

/** Something was committed: a search was sent. */
export function tapImpact() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}
