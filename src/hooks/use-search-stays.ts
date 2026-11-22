// src/hooks/use-search-stays.ts
// Search runs on the server: POST /api/search with the guest's sentence ({ q }) or an already-read intent ({ intent }).
// The first request for a sentence runs Jev; chip toggles and sort changes send the intent and skip it.
import { useAuth } from "@clerk/expo";
import { useCallback, useEffect, useRef, useState } from "react";

import type { SearchIntent } from "@/lib/search/intent";
import type { SortOption } from "@/lib/search/query";
import type { Stay } from "@/lib/stays";

export type SearchRequest = { q: string } | { intent: SearchIntent };

/** The server's answer. `intent` is how it read the sentence. */
type Answer = { intent: SearchIntent; total: number; stays: Stay[] };

export type SearchResult = Answer & {
  /** Changes every time a new result set arrives, which is what replays the stagger. */
  key: string;
  /** The request that produced it: tells the screen whether `intent` is the first reading of the sentence. */
  request: SearchRequest;
};

/** Carries the HTTP status. 401: no session. 400: bad request. 502: the search backend failed. */
export class SearchError extends Error {
  constructor(readonly status: number) {
    super(`search failed (${status})`);
    this.name = "SearchError";
  }
}

// Small in-memory cache, keyed by request + sort: going back to a query you already ran is instant.
const cache = new Map<string, Answer & { request: SearchRequest }>();

const keyOf = (request: SearchRequest, sort: SortOption) => JSON.stringify([request, sort]);

/**
 * Runs the search. Keeps the previous results on screen while a new sentence, toggle or sort loads. Pass
 * `undefined` to stay idle. The answer to a `{ q }` request is also stored under its `{ intent }` key, so putting
 * the reading into state (and sending `{ intent }` next) does not trigger a second request.
 */
export function useSearchStays(request: SearchRequest | undefined, sort: SortOption) {
  const { getToken } = useAuth();
  const getTokenRef = useRef(getToken);
  useEffect(() => {
    getTokenRef.current = getToken;
  });

  const key = request ? keyOf(request, sort) : null;
  const [result, setResult] = useState<SearchResult | null>(null);
  // The answer on screen. The same object under a second cache key (see below) is not a new result.
  const shownRef = useRef<object | null>(null);
  const [error, setError] = useState<SearchError | null>(null);
  const [version, setVersion] = useState(0);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!request || !key) return;
    const arrive = (answer: Answer & { request: SearchRequest }) => {
      setError(null);
      if (shownRef.current === answer) return; // already showing it: no new key, so the rows do not replay
      shownRef.current = answer;
      setVersion((v) => v + 1);
      setResult({ ...answer, key: `${key}#`, request: answer.request });
    };

    const hit = cache.get(key);
    if (hit) {
      arrive(hit);
      return;
    }

    const controller = new AbortController();
    setError(null);
    (async () => {
      const token = await getTokenRef.current();
      if (!token) throw new SearchError(401);
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ...request, sort }),
        signal: controller.signal,
      });
      if (!res.ok) throw new SearchError(res.status);
      const answer = (await res.json()) as Answer;
      const stored = { ...answer, request };
      cache.set(key, stored);
      if ("q" in request) cache.set(keyOf({ intent: answer.intent }, sort), stored);
      arrive(stored);
    })().catch((e: unknown) => {
      if (controller.signal.aborted) return;
      setError(e instanceof SearchError ? e : new SearchError(0));
    });
    return () => controller.abort();
    // `key` stands for `request` and `sort`: it changes exactly when their content does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);
  return {
    result: result ? { ...result, key: `${result.key}${version}` } : null,
    error,
    retry,
  };
}
