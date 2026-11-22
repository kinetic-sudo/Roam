// src/lib/server/search-groq.ts
// SearchIntent -> GROQ. Hard filters only for confident asks; everything else ranks (embeddings + boosts).
//
// The Context endpoint's `groq_query` takes no params, so values are written into the query text. `lit()` is the
// ONLY function that does it, and it accepts only: finite numbers, strings from the code-owned enums (types,
// amenities, vibes), place values from the known-place set, and the guest's sentence (cleaned, <= 300 chars,
// JSON-encoded). Anything else throws. This replaces "values always as params" for queries sent through Context;
// the CDN reads (Home, stay details, places) keep params.
import {
  AMENITIES,
  PROPERTY_TYPES,
  VIBES,
  cleanSentence,
  type SearchIntent,
} from "@/lib/search/intent";
import { placeVariants } from "@/lib/search/parse";
import type { SortOption } from "@/lib/search/query";

export const MAX_RESULTS = 50;

/** What a result card needs. photos is the cover only; the asset can be missing. */
export const PROJECTION = `{
  _id, title, slug, type, pricePerNight, maxGuests, rating, reviewCount,
  "photos": photos[0...1]{ alt, asset->{ url } },
  city, region, country, neighborhood, amenities,
  "houseRules": { "petsAllowed": coalesce(houseRules.petsAllowed, false) }
}`;

export const ORDERS: Record<SortOption, string> = {
  best: "order(rating desc, reviewCount desc, _id asc)",
  "price-asc": "order(pricePerNight asc, rating desc, _id asc)",
  "price-desc": "order(pricePerNight desc, rating desc, _id asc)",
  rating: "order(rating desc, reviewCount desc, _id asc)",
};

const TYPES = new Set<string>(PROPERTY_TYPES.map((t) => t.value));
const AMENITY_SET = new Set<string>(AMENITIES.map((a) => a.value));
const VIBE_SET = new Set<string>(VIBES);

export type Lit =
  | { kind: "number"; value: number }
  | { kind: "type" | "amenity" | "vibe"; value: string }
  | { kind: "place"; value: string; known: ReadonlySet<string> }
  | { kind: "text"; value: string };

export function lit(l: Lit): string {
  switch (l.kind) {
    case "number": {
      const s = String(l.value);
      // Finite, plain decimal: no NaN, Infinity or exponent form.
      if (!Number.isFinite(l.value) || !/^-?\d+(\.\d+)?$/.test(s)) throw new Error("lit: not a plain number");
      return s;
    }
    case "type":
      if (!TYPES.has(l.value)) throw new Error("lit: unknown type");
      return JSON.stringify(l.value);
    case "amenity":
      if (!AMENITY_SET.has(l.value)) throw new Error("lit: unknown amenity");
      return JSON.stringify(l.value);
    case "vibe":
      if (!VIBE_SET.has(l.value)) throw new Error("lit: unknown vibe");
      return JSON.stringify(l.value);
    case "place":
      if (!l.known.has(l.value)) throw new Error("lit: unknown place");
      return JSON.stringify(l.value);
    case "text":
      return JSON.stringify(cleanSentence(l.value));
  }
}

const num = (value: number): string => lit({ kind: "number", value });
/** Weights print with at most 3 decimals. */
const weightNum = (w: number): string => num(Math.round(w * 1000) / 1000);
const uniq = <T,>(xs: T[]) => [...new Set(xs)];

function list(kind: "type" | "amenity" | "vibe", values: string[]): string {
  return `[${uniq(values)
    .map((value) => lit({ kind, value }))
    .join(", ")}]`;
}

/** The hard filters F. Only the entries the intent has. */
function filters(i: SearchIntent, known: ReadonlySet<string>): string[] {
  const f = [`_type == "property"`, `defined(slug.current)`];

  if (i.types.required.length) f.push(`type in ${list("type", i.types.required)}`);
  if (i.types.avoided.length) f.push(`!(type in ${list("type", i.types.avoided)})`);

  if (i.maxPrice !== undefined) f.push(`pricePerNight <= ${num(i.maxPrice)}`);
  if (i.minPrice !== undefined) f.push(`pricePerNight >= ${num(i.minPrice)}`);
  if (i.guests !== undefined) f.push(`maxGuests >= ${num(i.guests)}`);
  if (i.bedrooms !== undefined) f.push(`bedrooms >= ${num(i.bedrooms)}`);

  if (i.pets === "wanted") f.push(`houseRules.petsAllowed == true`);
  if (i.pets === "avoided") f.push(`houseRules.petsAllowed != true`);

  const required = uniq(i.amenities.required);
  if (required.length) f.push(`count(amenities[@ in ${list("amenity", required)}]) == ${num(required.length)}`);
  // coalesce: a stay with no amenities field has none of them, so it must pass.
  if (i.amenities.avoided.length)
    f.push(`count(coalesce(amenities, [])[@ in ${list("amenity", i.amenities.avoided)}]) == 0`);

  if (i.place) {
    const places = placeVariants(i.place)
      .map((value) => lit({ kind: "place", value, known }))
      .join(", ");
    f.push(`count([lower(city), lower(region), lower(country), lower(neighborhood)][@ in [${places}]]) > 0`);
  }
  return f;
}

/** Boosts for what the sentence leans toward. Amenity, type and pets weigh 2 x preference; vibes 3 x. */
function boosts(i: SearchIntent): string[] {
  const b: string[] = [];
  for (const a of i.amenities.preferred)
    b.push(`boost(${lit({ kind: "amenity", value: a.value })} in amenities, ${weightNum(a.weight * 2)})`);
  for (const t of i.types.preferred)
    b.push(`boost(type == ${lit({ kind: "type", value: t.value })}, ${weightNum(t.weight * 2)})`);
  if (!i.pets && i.petsWeight !== undefined && i.petsWeight > 0)
    b.push(`boost(houseRules.petsAllowed == true, ${weightNum(i.petsWeight * 2)})`);
  for (const v of i.vibes.preferred)
    b.push(`boost(vibes match ${lit({ kind: "vibe", value: v.value })}, ${weightNum(v.weight * 3)})`);
  return b;
}

/**
 * `{ "total": count(*[F]), "stays": *[F] | score(...) | order(...)[0...50]{ ...projection } }`
 *
 *  - Best match with a sentence: `score(text::semanticSimilarity(sentence), boost(...)...)`, then
 *    `order(<demote> asc, _score desc, rating desc, reviewCount desc)`. Avoided vibes are demoted with the order
 *    term because a negative boost weight scores 0.
 *  - Best match with an empty sentence: no score, `order(rating desc, reviewCount desc)`.
 *  - Any other sort: that sort's own order(), no score.
 */
export function buildSearchGroq(intent: SearchIntent, sort: SortOption, known: ReadonlySet<string>): string {
  const F = filters(intent, known).join(" && ");
  const text = cleanSentence(intent.text);

  let pipeline: string;
  if (sort !== "best") {
    pipeline = ORDERS[sort];
  } else if (text.length === 0) {
    pipeline = "order(rating desc, reviewCount desc)";
  } else {
    const score = [`text::semanticSimilarity(${lit({ kind: "text", value: text })})`, ...boosts(intent)].join(", ");
    const demote = intent.vibes.avoided.length
      ? `count(coalesce(vibes, [])[@ in ${list("vibe", intent.vibes.avoided)}]) asc, `
      : "";
    pipeline = `score(${score}) | order(${demote}_score desc, rating desc, reviewCount desc)`;
  }

  return `{ "total": count(*[${F}]), "stays": *[${F}] | ${pipeline}[0...${MAX_RESULTS}]${PROJECTION} }`;
}
