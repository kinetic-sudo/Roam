// src/lib/search/query.ts
// The Search screen's pure logic on a SearchIntent: sorting, chips, card tags, the empty-state description.
// The GROQ now lives on the server (src/lib/server/search-groq.ts). No network here.
import type { Amenity, PropertyType, Stay } from "../stays";
import {
  AMENITY_LABEL,
  TYPE_LABEL,
  emptyIntent,
  isVibe,
  type SearchIntent,
  type Weighted,
} from "./intent";

export { AMENITY_LABEL } from "./intent";

export type SortOption = "best" | "price-asc" | "price-desc" | "rating";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "best", label: "Best match" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
];

/** Fetched once by the server to teach the parser every real place name. */
export const PLACES_QUERY = `*[_type == "property"]{ city, region, country, neighborhood }`;

// ------------------------------------------------------------------ chips

export type ChipKind = "type" | "price" | "guests" | "pets" | "amenity" | "vibe";
export interface SearchChip {
  id: string;
  kind: ChipKind;
  label: string;
  /** What the chip sets when switched on (type, price, guests, amenity or vibe). */
  value?: string | number;
  /** True for the up-to-four extra filters offered after the ones understood from the query. */
  suggested: boolean;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const titleCase = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

/** A vibe shows as a chip, and counts as switched on, from this weight up. */
const VIBE_CHIP_WEIGHT = 0.6;
const preferredVibes = (i: SearchIntent) => i.vibes.preferred.filter((v) => v.weight >= VIBE_CHIP_WEIGHT);

/** Chips for the *interpreted* sentence, in a fixed order, so toggling one off never makes it disappear. */
export function chipsFor(base: SearchIntent): SearchChip[] {
  const chips: SearchChip[] = [];
  for (const t of base.types.required)
    chips.push({ id: `type-${t}`, kind: "type", label: TYPE_LABEL[t], value: t, suggested: false });
  if (base.maxPrice !== undefined)
    chips.push({ id: "price", kind: "price", label: `Under $${base.maxPrice}`, value: base.maxPrice, suggested: false });
  if (base.guests !== undefined)
    chips.push({ id: "guests", kind: "guests", label: `${base.guests}+ guests`, value: base.guests, suggested: false });
  if (base.pets === "wanted") chips.push({ id: "pets", kind: "pets", label: "Pet Friendly", suggested: false });
  for (const a of base.amenities.required)
    chips.push({ id: `am-${a}`, kind: "amenity", label: AMENITY_LABEL[a], value: a, suggested: false });
  for (const v of preferredVibes(base))
    chips.push({ id: `vibe-${v.value}`, kind: "vibe", label: cap(v.value), value: v.value, suggested: false });

  const suggestions: SearchChip[] = [
    { id: "sug-price", kind: "price", label: "Under $300", value: 300, suggested: true },
    { id: "sug-pets", kind: "pets", label: "Pet Friendly", suggested: true },
    { id: "sug-vibe-quiet", kind: "vibe", label: "Quiet", value: "quiet", suggested: true },
    { id: "sug-am-hotTub", kind: "amenity", label: "Hot Tub", value: "hotTub", suggested: true },
    { id: "sug-am-pool", kind: "amenity", label: "Pool", value: "pool", suggested: true },
    { id: "sug-am-fireplace", kind: "amenity", label: "Fireplace", value: "fireplace", suggested: true },
  ];
  const taken = (s: SearchChip) =>
    s.kind === "price"
      ? base.maxPrice !== undefined
      : s.kind === "pets"
        ? base.pets === "wanted"
        : s.kind === "vibe"
          ? preferredVibes(base).some((v) => v.value === s.value)
          : base.amenities.required.includes(s.value as Amenity);
  return [...chips, ...suggestions.filter((s) => !taken(s)).slice(0, 4)];
}

/** Is this chip's constraint part of the *current* (toggled) intent? */
export function hasChip(current: SearchIntent, chip: SearchChip): boolean {
  switch (chip.kind) {
    case "type":
      return current.types.required.includes(chip.value as PropertyType);
    case "price":
      return current.maxPrice === chip.value;
    case "guests":
      return current.guests === chip.value;
    case "pets":
      return current.pets === "wanted";
    case "amenity":
      return current.amenities.required.includes(chip.value as Amenity);
    case "vibe":
      return preferredVibes(current).some((v) => v.value === chip.value);
  }
}

const without = <T extends string>(list: T[], value: T) => list.filter((x) => x !== value);
const withoutWeighted = <T extends string>(list: Weighted<T>[], value: T) => list.filter((x) => x.value !== value);

/**
 * Switch a chip's constraint on or off. Never mutates its input.
 * On: an amenity or type becomes required, a vibe becomes preferred with weight 1, pets become wanted.
 * Off: the item leaves every bucket (required, avoided and preferred).
 */
export function toggleChip(current: SearchIntent, chip: SearchChip): SearchIntent {
  const next: SearchIntent = {
    ...current,
    types: {
      required: [...current.types.required],
      avoided: [...current.types.avoided],
      preferred: [...current.types.preferred],
    },
    amenities: {
      required: [...current.amenities.required],
      avoided: [...current.amenities.avoided],
      preferred: [...current.amenities.preferred],
    },
    vibes: { preferred: [...current.vibes.preferred], avoided: [...current.vibes.avoided] },
  };
  const on = hasChip(current, chip);

  switch (chip.kind) {
    case "type": {
      const t = chip.value as PropertyType;
      next.types = {
        required: on ? without(next.types.required, t) : [...without(next.types.required, t), t],
        avoided: without(next.types.avoided, t),
        preferred: withoutWeighted(next.types.preferred, t),
      };
      break;
    }
    case "price":
      if (on) delete next.maxPrice;
      else next.maxPrice = chip.value as number;
      break;
    case "guests":
      if (on) delete next.guests;
      else next.guests = chip.value as number;
      break;
    case "pets":
      delete next.petsWeight;
      if (on) delete next.pets;
      else next.pets = "wanted";
      break;
    case "amenity": {
      const a = chip.value as Amenity;
      next.amenities = {
        required: on ? without(next.amenities.required, a) : [...without(next.amenities.required, a), a],
        avoided: without(next.amenities.avoided, a),
        preferred: withoutWeighted(next.amenities.preferred, a),
      };
      break;
    }
    case "vibe": {
      const v = chip.value as string;
      if (!isVibe(v)) break;
      next.vibes = {
        preferred: on
          ? withoutWeighted(next.vibes.preferred, v)
          : [...withoutWeighted(next.vibes.preferred, v), { value: v, weight: 1 }],
        avoided: without(next.vibes.avoided, v),
      };
      break;
    }
  }
  return next;
}

/**
 * What the sentence was read as, for the empty state: the place, the filters that are on, and the avoided ones
 * ("No Hot Tub", "Not Cabins", "No Pets") so guests see why nothing matched.
 */
export function describeIntent(intent: SearchIntent): string[] {
  const out: string[] = [];
  if (intent.place) out.push(titleCase(intent.place));
  for (const t of intent.types.required) out.push(TYPE_LABEL[t]);
  if (intent.maxPrice !== undefined) out.push(`Under $${intent.maxPrice}`);
  if (intent.minPrice !== undefined) out.push(`From $${intent.minPrice}`);
  if (intent.guests !== undefined) out.push(`${intent.guests}+ guests`);
  if (intent.bedrooms !== undefined) out.push(`${intent.bedrooms}+ bedrooms`);
  if (intent.pets === "wanted") out.push("Pet Friendly");
  for (const a of intent.amenities.required) out.push(AMENITY_LABEL[a]);
  for (const v of preferredVibes(intent)) out.push(cap(v.value));
  for (const a of intent.amenities.avoided) out.push(`No ${AMENITY_LABEL[a]}`);
  for (const t of intent.types.avoided) out.push(`Not ${TYPE_LABEL[t]}`);
  if (intent.pets === "avoided") out.push("No Pets");
  return out;
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

/** An intent with nothing set: `stayTags` with this asks "what is this stay known for?". */
export const EMPTY_INTENT: SearchIntent = emptyIntent("");

/**
 * Up to `max` tags: what the guest asked for first (required amenities, then pets when wanted), then the stay's
 * first standout amenity, Pet Friendly if allowed, the next amenities, and finally everyday ones.
 * With an empty intent and `max` 4, Lake Arrowhead gives Hot Tub, Pet Friendly, Fireplace, Fire Pit.
 */
export function stayTags(
  stay: Pick<Stay, "amenities" | "houseRules">,
  intent: SearchIntent,
  max: number,
): { key: TagKey; label: string }[] {
  const has = (a: Amenity) => stay.amenities.includes(a);
  const petsOk = !!stay.houseRules?.petsAllowed;
  const ordered: TagKey[] = [];
  const add = (k: TagKey) => {
    if (!ordered.includes(k)) ordered.push(k);
  };

  for (const a of intent.amenities.required) if (has(a)) add(a);
  if (intent.pets === "wanted" && petsOk) add("pets");
  const standouts = PRIORITY.filter(has);
  if (standouts[0]) add(standouts[0]);
  if (petsOk) add("pets");
  for (const a of standouts.slice(1)) add(a);
  for (const a of FALLBACK) if (has(a)) add(a);

  return ordered.slice(0, max).map((key) => ({
    key,
    label: key === "pets" ? "Pet Friendly" : AMENITY_LABEL[key],
  }));
}

/** The two tags on a Search result card. */
export const matchTags = (stay: Pick<Stay, "amenities" | "houseRules">, intent: SearchIntent) =>
  stayTags(stay, intent, 2);
