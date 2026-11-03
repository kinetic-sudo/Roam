// src/hooks/use-search-stays.ts
import { useCallback, useEffect, useState } from "react";

import { sanityQuery } from "@/lib/sanity";
import { knownPlaces, type ParsedQuery } from "@/lib/search/parse";
import {
  buildSearchQuery,
  PLACES_QUERY,
  searchKey,
  type SortOption,
} from "@/lib/search/query";
import type { Stay } from "@/lib/stays";

type Result = { total: number; stays: Stay[] };
export type SearchStatus = "loading" | "ready" | "error";

// Small in-memory cache, keyed by structured query + sort: going back to a query you already ran is instant.
const cache = new Map<string, Result>();

// ---------------------------------------------------------------- places (fetched once per session)
let places: string[] | null = null;
let placesPromise: Promise<string[]> | null = null;
function loadPlaces(): Promise<string[]> {
  placesPromise ??= sanityQuery<
    {
      city?: string;
      region?: string;
      country?: string;
      neighborhood?: string;
    }[]
  >(PLACES_QUERY)
    .then(knownPlaces)
    .catch(() => [] as string[]) // no place names: the parser still knows US states and countries
    .then((p) => (places = p));
  return placesPromise;
}

/** Every real place name, so "in Lisbon" and "in Bali" parse. null until the first fetch settles. */
export function usePlaces(): string[] | null {
  const [value, setValue] = useState<string[] | null>(places);
  useEffect(() => {
    let live = true;
    loadPlaces().then((p) => live && setValue(p));
    return () => {
      live = false;
    };
  }, []);
  return value;
}

// ---------------------------------------------------------------- search
/**
 * Runs the structured query against Sanity. Keeps the previous results on screen while a new query, toggle or
 * sort loads. `requestKey` changes every time a new result set arrives, which is what replays the stagger.
 */
export function useSearchStays(
  parsed: ParsedQuery,
  sort: SortOption,
  enabled: boolean,
) {
  const key = searchKey(parsed, sort);
  const [result, setResult] = useState<Result | null>(
    () => cache.get(key) ?? null,
  );
  const [status, setStatus] = useState<SearchStatus>(() =>
    cache.has(key) ? "ready" : "loading",
  );
  const [version, setVersion] = useState(0);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const hit = cache.get(key);
    if (hit) {
      setResult(hit);
      setStatus("ready");
      setVersion((v) => v + 1);
      return;
    }
    const controller = new AbortController();
    setStatus("loading");
    const { query, params } = buildSearchQuery(parsed, sort);
    sanityQuery<Result>(query, params, controller.signal)
      .then((r) => {
        cache.set(key, r);
        setResult(r);
        setStatus("ready");
        setVersion((v) => v + 1);
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus("error");
      });
    return () => controller.abort();
    // `key` stands for `parsed` and `sort`: it changes exactly when their content does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled, attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);
  return {
    stays: result?.stays ?? [],
    total: result?.total ?? 0,
    hasResult: result !== null,
    status,
    retry,
    requestKey: `${key}#${version}`,
  };
}
