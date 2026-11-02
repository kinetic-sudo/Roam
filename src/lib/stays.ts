// src/lib/stays.ts
// Shapes of the `property` documents the app reads from Sanity. Keep in step with studio/schemaTypes/property.ts.

export type PropertyType = "cabin" | "beach" | "city" | "villa";
export const PROPERTY_TYPES: PropertyType[] = [
  "cabin",
  "beach",
  "city",
  "villa",
];

export type Amenity =
  | "hotTub"
  | "pool"
  | "fireplace"
  | "firePit"
  | "sauna"
  | "wifi"
  | "kitchen"
  | "workspace"
  | "parking"
  | "washer"
  | "ac"
  | "oceanView"
  | "lakeView"
  | "beachAccess"
  | "mountainView"
  | "bbq"
  | "evCharger";

export const AMENITIES: Amenity[] = [
  "hotTub",
  "pool",
  "fireplace",
  "firePit",
  "sauna",
  "wifi",
  "kitchen",
  "workspace",
  "parking",
  "washer",
  "ac",
  "oceanView",
  "lakeView",
  "beachAccess",
  "mountainView",
  "bbq",
  "evCharger",
];

/** What the search projection returns for a photo. `asset` can be missing: 14 seeded stays have no photo yet. */
export interface StayPhoto {
  alt?: string | null;
  asset?: { url: string } | null;
}

export interface Stay {
  _id: string;
  title: string;
  slug: { current: string };
  type: PropertyType;
  pricePerNight: number;
  maxGuests: number;
  rating: number;
  reviewCount: number;
  /** Cover photo only (the search projection takes photos[0...1]). May be empty. */
  photos: StayPhoto[];
  city: string;
  /** Not every stay has one: international stays show "city, country". */
  region?: string | null;
  country: string;
  neighborhood?: string | null;
  amenities: Amenity[];
  houseRules: { petsAllowed: boolean };
  summary?: string;
  description?: string;
  highlights?: string[];
}

/** "Lake Arrowhead, CA" or "Lisbon, Portugal". */
export const placeLabel = (s: Pick<Stay, "city" | "region" | "country">) =>
  `${s.city}, ${s.region || s.country}`;
