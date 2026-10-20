// Class strings are written out in full so Tailwind can detect them.
// Tone (not a text-* className) sets color: two color classes on one element
// resolve by CSS order, not by call order.
export const toneClass = {
  ink: "text-ink",
  muted: "text-ink-muted",
  subtle: "text-ink-subtle",
  inverse: "text-surface",
  accent: "text-accent",
  success: "text-success",
  danger: "text-danger",
  info: "text-info",
} as const;

export type Tone = keyof typeof toneClass;
