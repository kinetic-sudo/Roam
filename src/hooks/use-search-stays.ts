// src/hooks/use-search-stays.ts
import { useEffect, useState } from "react";
import { client } from "../lib/sanity";
import { ParsedQuery } from "../lib/search/parse";
import { buildSearchQuery, SortOption } from "../lib/search/query";
import { Stay } from "../lib/stays";

export function useSearchStays(parsed: ParsedQuery, sort: SortOption) {
  const [stays, setStays] = useState<Stay[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);

    const { query, params } = buildSearchQuery(parsed, sort);

    client
      .fetch(query, params, { signal: controller.signal })
      .then((res: { total: number; stays: Stay[] }) => {
        setStays(res.stays || []);
        setTotal(res.total || 0);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(true);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [JSON.stringify(parsed), sort]);

  return { stays, total, loading, error };
}
