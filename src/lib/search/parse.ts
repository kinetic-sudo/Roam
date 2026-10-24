import type { Amenity, PropertyType } from "@/data/properties";

export type ParsedQuery = {
  maxPrice?: number;
  guests?: number;
  type?: PropertyType;
  amenities: Amenity[];
  pets?: boolean;
  /** Everything left over: soft words like "quiet" or "cozy" that rank instead of filter. */
  terms: string[];
};

// Stand-in for the AI pipeline. In Sanity this becomes GROQ params + embeddings.

const PRICE_UNDER =
  /\b(?:under|below|less than|max(?:imum)?|up to|within|cheaper than|no more than)\s*\$?\s*(\d{2,4})(?:\s*(?:dollars|usd|bucks))?(?:\s*(?:a|per|\/)\s*night)?/;
const PRICE_DOLLAR = /\$\s*(\d{2,4})(?:\s*(?:a|per|\/)\s*night)?/;
const PRICE_WORD =
  /\b(\d{2,4})\s*(?:dollars|usd|bucks)(?:\s*(?:a|per)\s*night)?/;

const GUESTS_FOR = /\bfor\s+(\d{1,2})\b(?!\s*(?:nights?|days?|weeks?|\d))/;
const GUESTS_NOUN =
  /\b(\d{1,2})\s*(?:guests?|people|persons?|adults?|travell?ers?|of us)\b/;

const PETS =
  /\b(?:pet[- ]?friendly|pets?[- ]?(?:allowed|ok|welcome)|dog[- ]?friendly|dogs?|puppy|puppies|(?:with|bring)\s+(?:my|our)\s+(?:pets?|dogs?))\b/;

const TYPES: [PropertyType, RegExp][] = [
  ["cabin", /\b(?:cabins?|chalets?|lodges?)\b/],
  ["beach", /\b(?:beach(?:es|front)?|oceanfront|seaside|coastal)\b/],
  ["villa", /\bvillas?\b/],
  [
    "city",
    /\b(?:city|cities|apartments?|lofts?|downtown|condos?|studios?|flats?)\b/,
  ],
];

const AMENITIES: [Amenity, RegExp][] = [
  ["hot tub", /\b(?:hot[- ]?tubs?|jacuzzi)\b/],
  ["pool", /\b(?:swimming pool|pools?)\b/],
  ["fireplace", /\b(?:fire[- ]?places?|wood[- ]?stove)\b/],
  ["wifi", /\b(?:wi-?fi|internet)\b/],
  ["kitchen", /\bkitchens?\b/],
  ["sauna", /\bsaunas?\b/],
  ["ocean view", /\b(?:ocean|sea)\s*views?\b/],
  ["lake view", /\blake\s*views?\b/],
  ["mountain view", /\bmountain\s*views?\b/],
  ["bbq", /\b(?:bbq|barbecue|grill)\b/],
  ["gym", /\b(?:gym|fitness)\b/],
  ["parking", /\b(?:parking|garage)\b/],
];

const STOP = new Set(
  "a an the with for in on at to of and or night nights per under below over stay stays place places house houses home homes near me i we us my our want looking find need get some that this is it its has have any can could would like please show give good great nice somewhere something".split(
    " ",
  ),
);

export function parseQuery(input: string): ParsedQuery {
  let rest = ` ${input.toLowerCase()} `;
  const take = (re: RegExp): RegExpMatchArray | null => {
    const m = rest.match(re);
    if (m) rest = rest.replace(re, " ");
    return m;
  };

  const out: ParsedQuery = { amenities: [], terms: [] };

  const price = take(PRICE_UNDER) ?? take(PRICE_DOLLAR) ?? take(PRICE_WORD);
  if (price) out.maxPrice = Number(price[1]);

  const guests = take(GUESTS_FOR) ?? take(GUESTS_NOUN);
  if (guests) {
    const n = Number(guests[1]);
    if (n >= 1 && n <= 20) out.guests = n;
  }

  if (take(PETS)) out.pets = true;

  // Amenities first, so "ocean view" never turns into a beach filter.
  for (const [name, re] of AMENITIES) if (take(re)) out.amenities.push(name);

  // The type word that appears first wins.
  let best: { type: PropertyType; index: number } | null = null;
  for (const [type, re] of TYPES) {
    const idx = rest.search(re);
    if (idx !== -1 && (!best || idx < best.index)) best = { type, index: idx };
  }
  if (best) {
    out.type = best.type;
    for (const [, re] of TYPES)
      rest = rest.replace(new RegExp(re.source, "g"), " ");
  }

  out.terms = rest
    .split(/[^a-z]+/)
    .filter((w) => w.length >= 3 && !STOP.has(w));

  return out;
}
