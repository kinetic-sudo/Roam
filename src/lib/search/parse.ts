// src/lib/search/parse.ts
// Turns what a guest types into typed filters (type, price, guests, pets, amenities, place) plus soft "vibe" words.
// Pure functions, no network. Hard constraints filter; vibes only rank (see query.ts).
import type { Amenity, PropertyType } from "../stays";

export interface ParsedQuery {
  type?: PropertyType;
  maxPrice?: number;
  guests?: number;
  pets?: boolean;
  amenities: Amenity[];
  /** Lower-case place the guest asked for. */
  place?: string;
  /** The other form of the same place, lower-case: "california" <-> "ca". Compared with lower(region)/lower(country). */
  placeAlt?: string;
  /** Soft words that rank results but never exclude them. */
  vibes: string[];
  rawText: string;
}

export const US_STATES: Record<string, string> = {
  alabama: "AL",
  alaska: "AK",
  arizona: "AZ",
  arkansas: "AR",
  california: "CA",
  colorado: "CO",
  connecticut: "CT",
  delaware: "DE",
  florida: "FL",
  georgia: "GA",
  hawaii: "HI",
  idaho: "ID",
  illinois: "IL",
  indiana: "IN",
  iowa: "IA",
  kansas: "KS",
  kentucky: "KY",
  louisiana: "LA",
  maine: "ME",
  maryland: "MD",
  massachusetts: "MA",
  michigan: "MI",
  minnesota: "MN",
  mississippi: "MS",
  missouri: "MO",
  montana: "MT",
  nebraska: "NE",
  nevada: "NV",
  "new hampshire": "NH",
  "new jersey": "NJ",
  "new mexico": "NM",
  "new york": "NY",
  "north carolina": "NC",
  "north dakota": "ND",
  ohio: "OH",
  oklahoma: "OK",
  oregon: "OR",
  pennsylvania: "PA",
  "rhode island": "RI",
  "south carolina": "SC",
  "south dakota": "SD",
  tennessee: "TN",
  texas: "TX",
  utah: "UT",
  vermont: "VT",
  virginia: "VA",
  washington: "WA",
  "west virginia": "WV",
  wisconsin: "WI",
  wyoming: "WY",
  "district of columbia": "DC",
};
const STATE_BY_CODE: Record<string, string> = Object.fromEntries(
  Object.entries(US_STATES).map(([n, c]) => [c.toLowerCase(), n]),
);

/** Ways people write a country, mapped to the name stored in `country`. */
const COUNTRY_ALIASES: Record<string, string> = {
  usa: "united states",
  "u.s.": "united states",
  "u.s.a.": "united states",
  america: "united states",
  "united states of america": "united states",
  uk: "united kingdom",
  "u.k.": "united kingdom",
  britain: "united kingdom",
  "great britain": "united kingdom",
  england: "united kingdom",
  holland: "netherlands",
};

const VIBE_WORDS = new Set([
  "quiet",
  "cozy",
  "secluded",
  "romantic",
  "peaceful",
  "luxury",
  "family",
  "lively",
  "walkable",
  "rustic",
  "modern",
  "views",
]);

const NUMBER_WORDS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
};

const NOT_A_PRICE =
  "(?!\\s*(?:guests?|people|persons?|nights?|bedrooms?|beds?|stars?))";
const PRICE_UNDER = new RegExp(
  `\\b(?:under|below|less than|cheaper than|max(?:imum)?(?: of)?|up to|within|no more than)\\s*\\$?\\s*(\\d{2,4})\\b${NOT_A_PRICE}(?:\\s*(?:dollars|usd|bucks))?(?:\\s*(?:a|per|/)\\s*night)?`,
);
const PRICE_LT = new RegExp(`<\\s*=?\\s*\\$?\\s*(\\d{2,4})\\b${NOT_A_PRICE}`);
const PRICE_DOLLAR = /\$\s*(\d{2,4})\b(?:\s*(?:a|per|\/)\s*night)?/;
const PRICE_WORD =
  /\b(\d{2,4})\s*(?:dollars|usd|bucks)\b(?:\s*(?:a|per)\s*night)?/;

const GUESTS_NOUN =
  /\b(\d{1,2})\s*\+?\s*(?:guests?|people|persons?|adults?|travell?ers?|of us)\b/;
const GUESTS_FOR =
  /\bfor\s+(\d{1,2})\b(?!\s*(?:nights?|days?|weeks?|months?|bedrooms?|beds?|\d))/;
const GUESTS_SLEEPS = /\b(?:sleeps?|sleeping)\s+(\d{1,2})\b/;
const GUESTS_FOR_WORD = new RegExp(
  `\\bfor\\s+(${Object.keys(NUMBER_WORDS).join("|")})\\b(?!\\s*(?:nights?|days?|weeks?|bedrooms?|beds?))`,
);

const PETS =
  /\b(?:pet[- ]?friendly|pets?[- ]?(?:allowed|ok|welcome|friendly)|dog[- ]?friendly|dogs?|puppy|puppies|cats?)\b/;

// Word-boundary patterns: a bare substring test would find "ac" inside "beach" and "peaceful".
const AMENITY_PATTERNS: [Amenity, RegExp][] = [
  ["hotTub", /\b(?:hot[- ]?tubs?|jacuzzi)\b/],
  ["firePit", /\bfire[- ]?pits?\b/],
  ["fireplace", /\b(?:fire[- ]?places?|wood[- ]?stove)\b/],
  ["pool", /\b(?:swimming pools?|pools?)\b/],
  ["sauna", /\bsaunas?\b/],
  ["wifi", /\b(?:wi-?fi|internet)\b/],
  ["kitchen", /\bkitchens?\b/],
  ["workspace", /\b(?:workspace|work space|home office|desk)\b/],
  ["parking", /\b(?:parking|garage)\b/],
  ["washer", /\b(?:washer|washing machine|laundry)\b/],
  ["ac", /\b(?:a\/c|ac|air[- ]?con(?:ditioning)?)\b/],
  ["oceanView", /\b(?:ocean|sea)[- ]?views?\b/],
  ["lakeView", /\blake[- ]?views?\b/],
  ["beachAccess", /\bbeach access\b/],
  ["mountainView", /\bmountain[- ]?views?\b/],
  ["bbq", /\b(?:bbq|barbecue|grill)\b/],
  ["evCharger", /\b(?:ev[- ]?charg(?:er|ers|ing)|electric vehicle charg\w+)\b/],
];

const TYPE_PATTERNS: [PropertyType, RegExp][] = [
  ["cabin", /\b(?:cabins?|chalets?|lodges?)\b/],
  ["beach", /\b(?:beach(?:es|front)?|oceanfront|seaside|coastal)\b/],
  ["villa", /\bvillas?\b/],
  [
    "city",
    /\b(?:city|cities|apartments?|lofts?|downtown|condos?|studios?|flats?|penthouses?)\b/,
  ],
];

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Every distinct place name in the data, lower-cased. Feed it the rows of PLACES_QUERY. */
export function knownPlaces(
  rows: {
    city?: string | null;
    region?: string | null;
    country?: string | null;
    neighborhood?: string | null;
  }[],
): string[] {
  const out = new Set<string>();
  for (const r of rows)
    for (const v of [r.city, r.region, r.country, r.neighborhood])
      if (v && v.trim().length >= 3) out.add(v.trim().toLowerCase());
  return [...out];
}

function findPlace(
  rest: string,
  places: string[],
): { place: string; alt?: string; re: RegExp } | null {
  // Longest name first, so "mexico city" wins over "mexico" and "tahoe city" is not read as the word "city".
  const names = [
    ...new Set([
      ...places,
      ...Object.keys(US_STATES),
      ...Object.keys(COUNTRY_ALIASES),
    ]),
  ]
    .filter((n) => n.length >= 3)
    .sort((a, b) => b.length - a.length);
  const lead = "(?:\\b(?:in|near|around)\\s+(?:the\\s+)?)?";
  for (const name of names) {
    const re = new RegExp(`${lead}(?<![\\w.])${esc(name)}(?![\\w])`);
    if (!re.test(rest)) continue;
    if (COUNTRY_ALIASES[name]) return { place: COUNTRY_ALIASES[name], re };
    if (US_STATES[name])
      return { place: name, alt: US_STATES[name].toLowerCase(), re };
    return { place: name, re };
  }
  // Two-letter state codes only count after "in" / "near" ("in ca"), never on their own.
  const code = rest.match(/\b(?:in|near|around)\s+([a-z]{2})\b/);
  if (code && STATE_BY_CODE[code[1]]) {
    return {
      place: code[1],
      alt: STATE_BY_CODE[code[1]],
      re: new RegExp(`\\b(?:in|near|around)\\s+${code[1]}\\b`),
    };
  }
  return null;
}

export function parseSearchQuery(
  queryText: string,
  places: string[] = [],
): ParsedQuery {
  const out: ParsedQuery = { amenities: [], vibes: [], rawText: queryText };
  let rest = ` ${queryText.toLowerCase().replace(/\s+/g, " ")} `;
  const take = (re: RegExp) => {
    const m = rest.match(re);
    if (m) rest = rest.replace(re, " ");
    return m;
  };

  const price =
    take(PRICE_UNDER) ??
    take(PRICE_LT) ??
    take(PRICE_DOLLAR) ??
    take(PRICE_WORD);
  if (price) out.maxPrice = Number(price[1]);

  const g = take(GUESTS_NOUN) ?? take(GUESTS_SLEEPS) ?? take(GUESTS_FOR);
  if (g) {
    const n = Number(g[1]);
    if (n >= 1 && n <= 20) out.guests = n;
  } else {
    const w = take(GUESTS_FOR_WORD);
    if (w) out.guests = NUMBER_WORDS[w[1]];
  }

  if (take(PETS)) out.pets = true;

  for (const [amenity, re] of AMENITY_PATTERNS)
    if (take(re) && !out.amenities.includes(amenity))
      out.amenities.push(amenity);

  const place = findPlace(rest, places);
  if (place) {
    out.place = place.place;
    if (place.alt) out.placeAlt = place.alt;
    rest = rest.replace(place.re, " ");
  }

  // The type word that comes first wins.
  let best: { type: PropertyType; index: number } | null = null;
  for (const [type, re] of TYPE_PATTERNS) {
    const i = rest.search(re);
    if (i !== -1 && (!best || i < best.index)) best = { type, index: i };
  }
  if (best) {
    out.type = best.type;
    for (const [, re] of TYPE_PATTERNS)
      rest = rest.replace(new RegExp(re.source, "g"), " ");
  }

  for (const word of rest.split(/[^a-z]+/))
    if (VIBE_WORDS.has(word) && !out.vibes.includes(word)) out.vibes.push(word);

  return out;
}
