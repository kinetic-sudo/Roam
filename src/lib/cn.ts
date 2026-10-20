type ClassValue = string | false | null | undefined;

/** Joins class names, skipping falsy values. Order does not decide conflicts (CSS order does), so don't pass two classes for the same property. */
export function cn(...parts: ClassValue[]): string {
  return parts.filter(Boolean).join(" ");
}
