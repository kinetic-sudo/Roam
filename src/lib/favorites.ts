import { useSyncExternalStore } from "react";

// In-memory saved stays, shared by every screen. Not persisted yet (resets on app restart).
let saved: ReadonlySet<string> = new Set();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function toggleFavorite(id: string) {
  const next = new Set(saved);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  saved = next;
  listeners.forEach((l) => l());
}

export function useIsFavorite(id: string): boolean {
  return useSyncExternalStore(
    subscribe,
    () => saved.has(id),
    () => false,
  );
}
