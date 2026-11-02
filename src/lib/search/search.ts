// src/lib/search/search.ts
import { client } from "@/lib/sanity";
import { Stay } from "@/lib/stays";
import { useEffect, useState } from "react";
import { ParsedQuery } from "./parse";
import { buildSearchQuery, SortOption } from "./query";

export type SortKey = "best" | "price" | "rating";

// Map our SortKey to SortOption used in query.ts
export function toQuerySort(key: SortKey): SortOption {
  if (key === "price") return "price-asc";
  if (key === "rating") return "rating";
  return "best";
}

export function describeQuery(q: ParsedQuery): string[] {
  const out: string[] = [];
  if (q.type) out.push(q.type.charAt(0).toUpperCase() + q.type.slice(1) + "s");
  if (q.maxPrice !== undefined) out.push(`Up to $${q.maxPrice} a night`);
  if (q.guests !== undefined) out.push(`${q.guests}+ guests`);
  if (q.pets) out.push("Pets allowed");
  for (const a of q.amenities) out.push(a.replace(/([A-Z])/g, " $1").trim());
  for (const v of q.vibes) out.push(`“${v}”`);
  if (q.place) out.push(q.place);
  return out;
}

export function queryChips(q: ParsedQuery): string[] {
  const out: string[] = [];
  if (q.type) out.push(q.type.charAt(0).toUpperCase() + q.type.slice(1) + "s");
  if (q.maxPrice !== undefined) out.push(`Under $${q.maxPrice}`);
  if (q.guests !== undefined) out.push(`${q.guests}+ guests`);
  if (q.pets) out.push("Pet Friendly");
  for (const a of q.amenities) out.push(a.replace(/([A-Z])/g, " $1").trim());
  for (const v of q.vibes) out.push(v.charAt(0).toUpperCase() + v.slice(1));
  return out;
}

/** Hook to fetch live stays from Sanity based on parsed query and sort key */
export function useSanitySearch(parsed: ParsedQuery, sortKey: SortKey) {
  const [stays, setStays] = useState<Stay[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    const sortOption = toQuerySort(sortKey);
    const { query, params } = buildSearchQuery(parsed, sortOption);

    client
      .fetch(query, params, { signal: controller.signal })
      .then((res: { total: number; stays: Stay[] }) => {
        setStays(res?.stays || []);
        setTotal(res?.total || 0);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [JSON.stringify(parsed), sortKey]);

  return { stays, total, loading };
}
