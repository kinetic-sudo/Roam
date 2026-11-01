// src/lib/favorites.ts
import { useSyncExternalStore } from "react";

const favorites = new Set<string>();
const listeners = new Set<() => void>();

export function toggleFavorite(id: string) {
  if (favorites.has(id)) {
    favorites.delete(id);
  } else {
    favorites.add(id);
  }
  listeners.forEach((l) => l());
}

export function useFavorite(id: string) {
  const isFav = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => favorites.has(id),
    () => favorites.has(id),
  );

  return [isFav, () => toggleFavorite(id)] as const;
}
