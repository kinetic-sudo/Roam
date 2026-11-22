// src/lib/server/places.ts
// Every real place name, so "in Lisbon" and "in Bali" parse. Read once from the public CDN (params, no token)
// and kept in the module for 10 minutes.
import { sanityQuery } from "@/lib/sanity";
import { knownPlaces as placeNames } from "@/lib/search/parse";
import { PLACES_QUERY } from "@/lib/search/query";

const TTL_MS = 10 * 60 * 1000;
let cache: { at: number; places: string[] } | null = null;
let inflight: Promise<string[]> | null = null;

type Row = { city?: string | null; region?: string | null; country?: string | null; neighborhood?: string | null };

export async function knownPlaces(now: number = Date.now()): Promise<string[]> {
  if (cache && now - cache.at < TTL_MS) return cache.places;
  inflight ??= sanityQuery<Row[]>(PLACES_QUERY)
    .then((rows) => {
      const places = placeNames(rows ?? []);
      cache = { at: Date.now(), places };
      return places;
    })
    // No place names: the parser still knows US states and countries. Not cached, so the next request retries.
    .catch(() => cache?.places ?? [])
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/** For tests. */
export function resetPlacesCache() {
  cache = null;
  inflight = null;
}
