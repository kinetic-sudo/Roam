import { properties as allProperties, type Property } from "@/data/properties";

import type { ParsedQuery } from "./parse";

export type SortKey = "best" | "price" | "rating";
// Soft words expand to related vibes so "quiet" also finds "peaceful" and "secluded".
const RELATED: Record<string, string[]> = {
  quiet: ["quiet", "peaceful", "secluded"],
  peaceful: ["peaceful", "quiet"],
  secluded: ["secluded", "quiet"],
  cozy: ["cozy", "rustic"],
  rustic: ["rustic", "cozy"],
  romantic: ["romantic"],
  luxury: ["luxury"],
  fancy: ["luxury"],
  modern: ["modern", "design"],
  lively: ["lively", "central"],
  cheap: ["budget"],
  affordable: ["budget"],
  scenic: ["scenic"],
  family: ["family"],
  tropical: ["tropical"],
};

function score(p: Property, terms: string[]): number {
  let s = 0;
  const text = `${p.title} ${p.description}`.toLowerCase();
  for (const t of terms) {
    const related = RELATED[t] ?? [t];
    if (p.vibes.some((v) => related.includes(v))) s += 2;
    if (text.includes(t)) s += 1;
  }
  return s;
}

/** Hard constraints filter; soft terms rank; ties break by rating, then review count. */
export function searchProperties(
  q: ParsedQuery,
  list: Property[] = allProperties,
): Property[] {
  return list
    .filter((p) =>
      q.maxPrice === undefined ? true : p.pricePerNight <= q.maxPrice,
    )
    .filter((p) => (q.guests === undefined ? true : p.maxGuests >= q.guests))
    .filter((p) => (q.type ? p.type === q.type : true))
    .filter((p) => (q.pets ? p.petsAllowed : true))
    .filter((p) => q.amenities.every((a) => p.amenities.includes(a)))
    .map((p) => ({ p, s: score(p, q.terms) }))
    .sort(
      (a, b) =>
        b.s - a.s ||
        b.p.rating - a.p.rating ||
        b.p.reviewCount - a.p.reviewCount,
    )
    .map(({ p }) => p);
}

const TYPE_LABEL = {
  cabin: "Cabins",
  beach: "Beach stays",
  city: "City stays",
  villa: "Villas",
} as const;

/** Human-readable constraints, for the "no matches" state. */
export function describeQuery(q: ParsedQuery): string[] {
  const out: string[] = [];
  if (q.type) out.push(TYPE_LABEL[q.type]);
  if (q.maxPrice !== undefined) out.push(`Up to $${q.maxPrice} a night`);
  if (q.guests !== undefined) out.push(`${q.guests}+ guests`);
  if (q.pets) out.push("Pets allowed");
  for (const a of q.amenities) out.push(a.charAt(0).toUpperCase() + a.slice(1));
  for (const t of q.terms) out.push(`“${t}”`);
  return out;
}

/** "Best match" is the ranking `searchProperties` already returns. */
/** "Best match" is the ranking `searchProperties` already returns. */
export function sortProperties(list: Property[], key: SortKey): Property[] {
  if (key === "price")
    return [...list].sort(
      (a, b) => a.pricePerNight - b.pricePerNight || b.rating - a.rating,
    );
  if (key === "rating")
    return [...list].sort(
      (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
    );
  return list;
}

const CHIP_TYPE = {
  cabin: "Cabins",
  beach: "Beach",
  city: "City",
  villa: "Villas",
} as const;
const title = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

/** What we understood from the query, as short chips: type, price, guests, pets, amenities, then soft words. */
export function queryChips(q: ParsedQuery): string[] {
  const out: string[] = [];
  if (q.type) out.push(CHIP_TYPE[q.type]);
  if (q.maxPrice !== undefined) out.push(`Under $${q.maxPrice}`);
  if (q.guests !== undefined) out.push(`${q.guests}+ guests`);
  if (q.pets) out.push("Pet Friendly");
  for (const a of q.amenities) out.push(title(a));
  for (const t of q.terms) out.push(title(t));
  return out;
}
