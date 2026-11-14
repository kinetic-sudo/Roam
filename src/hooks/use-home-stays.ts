// src/hooks/use-home-stays.ts
import { useCallback, useEffect, useState } from "react";

import { HOME_QUERY } from "@/lib/queries";
import { sanityQuery } from "@/lib/sanity";
import type { HomeStay } from "@/lib/stays";

export type HomeStatus = "loading" | "ready" | "error";

// Module cache: coming back to Home (or switching tabs) shows the grid at once.
let cache: HomeStay[] | null = null;

const hasPhoto = (s: HomeStay) => !!s.photos?.[0]?.asset?.url;

/** Stays with a photo first (14 seeded stays have none yet). The sort is stable, so Sanity's order holds inside each group. */
const photosFirst = (stays: HomeStay[]) => [
  ...stays.filter(hasPhoto),
  ...stays.filter((s) => !hasPhoto(s)),
];

/** Every stay for the Home grid, live from Sanity. */
export function useHomeStays() {
  const [stays, setStays] = useState<HomeStay[] | null>(cache);
  const [status, setStatus] = useState<HomeStatus>(cache ? "ready" : "loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (cache) {
      setStays(cache);
      setStatus("ready");
      return;
    }
    const controller = new AbortController();
    setStatus("loading");
    sanityQuery<HomeStay[]>(HOME_QUERY, {}, controller.signal)
      .then((result) => {
        cache = photosFirst(result ?? []);
        setStays(cache);
        setStatus("ready");
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus("error");
      });
    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);
  return { stays: stays ?? [], status, retry };
}
