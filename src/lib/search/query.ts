// src/lib/search/query.ts
// ParsedQuery -> GROQ, plus the chip and tag logic the Search screen needs. Pure functions, no network.
import type { Amenity, PropertyType, Stay } from "../stays";
import type { ParsedQuery } from "./parse";

export type SortOption = "best" | "price-asc" | "price-desc" | "rating";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "best", label: "Best match" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
];

/** Fetched once per app session to teach the parser every real place name. */
export const PLACES_QUERY = `*[_type == "property"]{ city, region, country, neighborhood }`;

/** What a result card needs. photos is the cover only; the asset can be missing. */
const PROJECTION = `{
  _id, title, slug, type, pricePerNight, maxGuests, rating, reviewCount,
  "photos": photos[0...1]{ alt, asset->{ url } },
  city, region, country, neighborhood, amenities,
  "houseRules": { "petsAllowed": coalesce(houseRules.petsAllowed, false) }
}`;

const ORDER: Record<SortOption, string> = {
  best: "order(rating desc, reviewCount desc, _id asc)",
  "price-asc": "order(pricePerNight asc, rating desc, _id asc)",
  "price-desc": "order(pricePerNight desc, rating desc, _id asc)",
  rating: "order(rating desc, reviewCount desc, _id asc)",
};

export function buildSearchQuery(
  parsed: ParsedQuery,
  sort: SortOption,
): { query: string; params: Record<string, unknown> } {
  const filters = [`_type == "property"`];
  const params: Record<string, unknown> = {};

  if (parsed.type) {
    filters.push("type == $type");
    params.type = parsed.type;
  }
  if (parsed.maxPrice !== undefined) {
    filters.push("pricePerNight <= $maxPrice");
    params.maxPrice = parsed.maxPrice;
  }
  if (parsed.guests !== undefined) {
    filters.push("maxGuests >= $guests");
    params.guests = parsed.guests;
  }
  if (parsed.pets) filters.push("houseRules.petsAllowed == true");
  if (parsed.amenities.length > 0) {
    filters.push("count(amenities[@ in $amenities]) == count($amenities)");
    params.amenities = parsed.amenities;
  }
  if (parsed.place) {
    filters.push(
      "($place in [lower(city), lower(region), lower(country), lower(neighborhood)] || $placeAlt in [lower(region), lower(country)])",
    );
    params.place = parsed.place;
    params.placeAlt = parsed.placeAlt ?? "";
  }
  const where = filters.join(" && ");

  // Soft words rank (only on "Best match"); they never exclude a stay. One boost per field: `match` on a
  // nested array of fields is not guaranteed to score, so each field gets its own boost.
  if (sort === "best" && parsed.vibes.length > 0) {
    const boosts = parsed.vibes
      .map((vibe, i) => {
        params[`vibe${i}`] = vibe;
        const t = `$vibe${i}`;
        return [
          `boost(vibes match ${t}, 3)`,
          `boost(title match ${t}, 1)`,
          `boost(summary match ${t}, 1)`,
          `boost(description match ${t}, 1)`,
          `boost(highlights match ${t}, 1)`,
          `boost(neighborhood match ${t}, 1)`,
        ].join(", ");
      })
      .join(", ");
    return {
      query: `{ "total": count(*[${where}]), "stays": *[${where}] | score(${boosts}) | order(_score desc, rating desc, reviewCount desc, _id asc)[0...50]${PROJECTION} }`,
      params,
    };
  }
  return {
    query: `{ "total": count(*[${where}]), "stays": *[${where}] | ${ORDER[sort]}[0...50]${PROJECTION} }`,
    params,
  };
}

// ------------------------------------------------------------------ chips

export type ChipKind =
  | "type"
  | "price"
  | "guests"
  | "pets"
  | "amenity"
  | "vibe";
export interface SearchChip {
  id: string;
  kind: ChipKind;
  label: string;
  /** What the chip sets when switched on (type, price, guests, amenity or vibe). */
  value?: string | number;
  /** True for the up-to-four extra filters offered after the ones understood from the query. */
  suggested: boolean;
}

const TYPE_LABEL: Record<PropertyType, string> = {
  cabin: "Cabins",
  beach: "Beach",
  city: "City",
  villa: "Villas",
};
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
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Chips for the *submitted* query, in a fixed order, so toggling one off never makes it disappear. */
export function chipsFor(base: ParsedQuery): SearchChip[] {
  const chips: SearchChip[] = [];
  if (base.type)
    chips.push({
      id: "type",
      kind: "type",
      label: TYPE_LABEL[base.type],
      value: base.type,
      suggested: false,
    });
  if (base.maxPrice !== undefined)
    chips.push({
      id: "price",
      kind: "price",
      label: `Under $${base.maxPrice}`,
      value: base.maxPrice,
      suggested: false,
    });
  if (base.guests !== undefined)
    chips.push({
      id: "guests",
      kind: "guests",
      label: `${base.guests}+ guests`,
      value: base.guests,
      suggested: false,
    });
  if (base.pets)
    chips.push({
      id: "pets",
      kind: "pets",
      label: "Pet Friendly",
      suggested: false,
    });
  for (const a of base.amenities)
    chips.push({
      id: `am-${a}`,
      kind: "amenity",
      label: AMENITY_LABEL[a],
      value: a,
      suggested: false,
    });
  for (const v of base.vibes)
    chips.push({
      id: `vibe-${v}`,
      kind: "vibe",
      label: cap(v),
      value: v,
      suggested: false,
    });

  const suggestions: SearchChip[] = [
    {
      id: "sug-price",
      kind: "price",
      label: "Under $300",
      value: 300,
      suggested: true,
    },
    { id: "sug-pets", kind: "pets", label: "Pet Friendly", suggested: true },
    {
      id: "sug-vibe-quiet",
      kind: "vibe",
      label: "Quiet",
      value: "quiet",
      suggested: true,
    },
    {
      id: "sug-am-hotTub",
      kind: "amenity",
      label: "Hot Tub",
      value: "hotTub",
      suggested: true,
    },
    {
      id: "sug-am-pool",
      kind: "amenity",
      label: "Pool",
      value: "pool",
      suggested: true,
    },
    {
      id: "sug-am-fireplace",
      kind: "amenity",
      label: "Fireplace",
      value: "fireplace",
      suggested: true,
    },
  ];
  const taken = (s: SearchChip) =>
    s.kind === "price"
      ? base.maxPrice !== undefined
      : s.kind === "pets"
        ? !!base.pets
        : s.kind === "vibe"
          ? base.vibes.includes(s.value as string)
          : base.amenities.includes(s.value as Amenity);
  return [...chips, ...suggestions.filter((s) => !taken(s)).slice(0, 4)];
}

/** Is this chip's constraint part of the *current* (toggled) query? */
export function isChipOn(current: ParsedQuery, chip: SearchChip): boolean {
  switch (chip.kind) {
    case "type":
      return current.type === chip.value;
    case "price":
      return current.maxPrice === chip.value;
    case "guests":
      return current.guests === chip.value;
    case "pets":
      return !!current.pets;
    case "amenity":
      return current.amenities.includes(chip.value as Amenity);
    case "vibe":
      return current.vibes.includes(chip.value as string);
  }
}

/** Switch a chip's constraint on or off. Never mutates its input. */
export function toggleChip(
  current: ParsedQuery,
  chip: SearchChip,
): ParsedQuery {
  const next: ParsedQuery = {
    ...current,
    amenities: [...current.amenities],
    vibes: [...current.vibes],
  };
  const on = isChipOn(current, chip);
  switch (chip.kind) {
    case "type":
      if (on) delete next.type;
      else next.type = chip.value as PropertyType;
      break;
    case "price":
      if (on) delete next.maxPrice;
      else next.maxPrice = chip.value as number;
      break;
    case "guests":
      if (on) delete next.guests;
      else next.guests = chip.value as number;
      break;
    case "pets":
      if (on) delete next.pets;
      else next.pets = true;
      break;
    case "amenity":
      next.amenities = on
        ? next.amenities.filter((a) => a !== chip.value)
        : [...next.amenities, chip.value as Amenity];
      break;
    case "vibe":
      next.vibes = on
        ? next.vibes.filter((v) => v !== chip.value)
        : [...next.vibes, chip.value as string];
      break;
  }
  return next;
}

// ------------------------------------------------------------------ tags

export type TagKey = Amenity | "pets";
const PRIORITY: Amenity[] = [
  "hotTub",
  "pool",
  "sauna",
  "fireplace",
  "oceanView",
  "lakeView",
  "mountainView",
  "beachAccess",
  "firePit",
];
const FALLBACK: Amenity[] = ["workspace", "wifi", "kitchen", "ac"];

/**
 * Up to two tags for a result card: what the guest asked for first (matched amenities, then pets), then the
 * stay's first standout amenity, Pet Friendly if allowed, the next amenity, and finally everyday ones.
 * "Hot Tub + Pet Friendly" for the spec's example query; "Pool + Ocean View" for a pool villa with no pets.
 */
export function matchTags(
  stay: Pick<Stay, "amenities" | "houseRules">,
  parsed: ParsedQuery,
): { key: TagKey; label: string }[] {
  const has = (a: Amenity) => stay.amenities.includes(a);
  const petsOk = !!stay.houseRules?.petsAllowed;
  const ordered: TagKey[] = [];
  const add = (k: TagKey) => {
    if (!ordered.includes(k)) ordered.push(k);
  };

  for (const a of parsed.amenities) if (has(a)) add(a);
  if (parsed.pets && petsOk) add("pets");
  const standouts = PRIORITY.filter(has);
  if (standouts[0]) add(standouts[0]);
  if (petsOk) add("pets");
  for (const a of standouts.slice(1)) add(a);
  for (const a of FALLBACK) if (has(a)) add(a);

  return ordered
    .slice(0, 2)
    .map((key) => ({
      key,
      label: key === "pets" ? "Pet Friendly" : AMENITY_LABEL[key],
    }));
}

/** Stable key for "has the query changed?" checks. */
export const searchKey = (parsed: ParsedQuery, sort: SortOption) =>
  JSON.stringify([{ ...parsed, rawText: "" }, sort]);
