// src/lib/favorites.ts
import { useSyncExternalStore } from "react";

// Saved stays for this session only. Not persisted: reopening the app clears them.
let saved: ReadonlySet<string> = new Set();
const listeners = new Set<() => void>();
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

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

/** [isSaved, toggle] for one stay. */
export function useFavorite(id: string): [boolean, () => void] {
  const isSaved = useIsFavorite(id);
  return [isSaved, () => toggleFavorite(id)];
}
