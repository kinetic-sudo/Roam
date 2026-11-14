// src/hooks/use-stay.ts
import { useCallback, useEffect, useState } from "react";

import { STAY_QUERY } from "@/lib/queries";
import { sanityQuery } from "@/lib/sanity";
import type { StayDetails, StayPolicy } from "@/lib/stays";

export type StayStatus = "loading" | "ready" | "error";

type Response = {
  stay: Omit<StayDetails, "policies"> | null;
  policies: StayPolicy[] | null;
};
type Entry = { slug: string; stay: StayDetails | null };

// Per-slug cache. `null` is a real answer: "this slug matches no stay". The Policies and Host sheets read the
// same cache, so they open instantly.
const cache = new Map<string, StayDetails | null>();

const fromCache = (slug: string): Entry | null =>
  cache.has(slug) ? { slug, stay: cache.get(slug) ?? null } : null;

/**
 * One stay by slug. `stay` is null while loading, on error, and when the slug matches nothing: read `status`.
 * The loaded stay is held in state as well as in the module cache: reading the cache during render is not
 * reactive (with the React Compiler on, it is memoised by slug and the screen would stay on its skeleton).
 */
export function useStay(slug: string) {
  const [entry, setEntry] = useState<Entry | null>(() => fromCache(slug));
  const [failedSlug, setFailedSlug] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const hit = fromCache(slug);
    if (hit) {
      setEntry(hit);
      return;
    }
    const controller = new AbortController();
    sanityQuery<Response>(STAY_QUERY, { slug }, controller.signal)
      .then((r) => {
        const stay = r.stay ? { ...r.stay, policies: r.policies ?? [] } : null;
        cache.set(slug, stay);
        setEntry({ slug, stay });
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailedSlug(slug);
      });
    return () => controller.abort();
  }, [slug, attempt]);

  const current = entry?.slug === slug ? entry : null;
  const status: StayStatus = current ? "ready" : failedSlug === slug ? "error" : "loading";

  const retry = useCallback(() => {
    setFailedSlug(null);
    setAttempt((a) => a + 1);
  }, []);

  return { stay: current?.stay ?? null, status, retry };
}
