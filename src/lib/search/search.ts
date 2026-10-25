import { properties as allProperties, type Property } from "@/data/properties";

import type { ParsedQuery } from "./parse";

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
