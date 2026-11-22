// src/lib/search/intent.ts
// What the guest's sentence means, as typed data. Pure TypeScript, no server imports: the app and the server share it.
// The server fills it in (Jev, or the regex parser as a fallback); the app edits it with chips and sends it back.
import type { Amenity, PropertyType } from "../stays";
import type { ParsedQuery } from "./parse";

export interface Weighted<T> {
  value: T;
  /** 0 to 1: how strongly the sentence leans this way. Used only to rank, never to filter. */
  weight: number;
}

export interface Bucket<T extends string> {
  /** Filters: every one must hold. */
  required: T[];
  /** Filters: none may hold. */
  avoided: T[];
  /** Boosts ranking only. */
  preferred: Weighted<T>[];
}

export interface SearchIntent {
  /** The guest's sentence, cleaned and cut to 300 characters. Embedded for ranking. */
  text: string;
  /** Who read it. `parser` is the regex fallback (or an empty sentence). */
  source: "jev" | "parser";
  /** Lower-case place from the known places (or a US state name/code). */
  place?: string;
  maxPrice?: number;
  minPrice?: number;
  guests?: number;
  bedrooms?: number;
  pets?: "wanted" | "avoided";
  /** Pets the sentence only leans toward (implied): ranks, never filters. */
  petsWeight?: number;
  types: Bucket<PropertyType>;
  amenities: Bucket<Amenity>;
  vibes: { preferred: Weighted<Vibe>[]; avoided: Vibe[] };
}

// ------------------------------------------------------------------ what Roam knows

/** Chip labels. */
export const TYPE_LABEL: Record<PropertyType, string> = {
  cabin: "Cabins",
  beach: "Beach",
  city: "City",
  villa: "Villas",
};

/** Jev's feature labels: the type, with the words people use for it. */
export const PROPERTY_TYPES: { value: PropertyType; feature: string }[] = [
  { value: "cabin", feature: "Type: Cabin (cabins, chalets, A-frames, lodges)" },
  { value: "beach", feature: "Type: Beach house (beachfront, seaside, bungalows)" },
  { value: "city", feature: "Type: City stay (apartments, lofts, studios, condos)" },
  { value: "villa", feature: "Type: Villa (villas, mansions)" },
];

export const AMENITY_LABEL: Record<Amenity, string> = {
  hotTub: "Hot Tub",
  pool: "Pool",
  fireplace: "Fireplace",
  firePit: "Fire Pit",
  sauna: "Sauna",
  wifi: "Wifi",
  kitchen: "Kitchen",
  workspace: "Workspace",
  parking: "Parking",
  washer: "Washer",
  ac: "A/C",
  oceanView: "Ocean View",
  lakeView: "Lake View",
  beachAccess: "Beach Access",
  mountainView: "Mountain View",
  bbq: "BBQ",
  evCharger: "EV Charger",
};

export const AMENITIES: { value: Amenity; feature: string }[] = (
  Object.keys(AMENITY_LABEL) as Amenity[]
).map((value) => ({ value, feature: `Amenity: ${AMENITY_LABEL[value]}` }));

/** The soft words stays are tagged with (the data has one more, "ski", on a single stay). */
export const VIBES = [
  "scenic",
  "quiet",
  "lively",
  "romantic",
  "family",
  "luxury",
  "modern",
  "relaxed",
  "cozy",
  "tropical",
  "peaceful",
  "central",
  "secluded",
  "design",
  "rustic",
  "budget",
] as const;
export type Vibe = (typeof VIBES)[number];

export const VIBE_FEATURES: { value: Vibe; feature: string }[] = VIBES.map((value) => ({
  value,
  feature: `Atmosphere: ${value}`,
}));

export const PETS_FEATURE = "Bringing pets (a pet-friendly stay that allows dogs or cats)";

export const isVibe = (s: string): s is Vibe => (VIBES as readonly string[]).includes(s);

// ------------------------------------------------------------------ building one

export const MAX_TEXT = 300;

/** Control characters and U+2028/2029 become spaces; trimmed; cut to 300 characters. */
export function cleanSentence(s: string): string {
  return s
    .replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]/g, " ")
    .trim()
    .slice(0, MAX_TEXT);
}

export function emptyIntent(text: string): SearchIntent {
  return {
    text: cleanSentence(text),
    source: "parser",
    types: { required: [], avoided: [], preferred: [] },
    amenities: { required: [], avoided: [], preferred: [] },
    vibes: { preferred: [], avoided: [] },
  };
}

/**
 * The fallback reading, from the regex parser: what it found is required (as before), and the soft words it
 * knows from the vibe list become preferred with weight 1.
 */
export function intentFromParsed(parsed: ParsedQuery): SearchIntent {
  const intent = emptyIntent(parsed.rawText);
  if (parsed.place) intent.place = parsed.place;
  if (parsed.maxPrice !== undefined) intent.maxPrice = parsed.maxPrice;
  if (parsed.guests !== undefined) intent.guests = parsed.guests;
  if (parsed.pets) intent.pets = "wanted";
  if (parsed.type) intent.types.required.push(parsed.type);
  intent.amenities.required.push(...parsed.amenities);
  for (const v of parsed.vibes) if (isVibe(v)) intent.vibes.preferred.push({ value: v, weight: 1 });
  return intent;
}
