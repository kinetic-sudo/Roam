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


/** What a Home card needs: the search projection without the filter-only fields. */
export type HomeStay = Pick<
  Stay,
  | "_id"
  | "title"
  | "slug"
  | "type"
  | "pricePerNight"
  | "rating"
  | "reviewCount"
  | "photos"
  | "city"
  | "region"
  | "country"
>;

// ------------------------------------------------------------------ stay details

/** Typed `houseRules` fields. Times are 24h "HH:MM". Anything the host left blank is null. */
export interface HouseRules {
  petsAllowed: boolean;
  maxPets?: number | null;
  petFee?: number | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  quietHoursFrom?: string | null;
  quietHoursTo?: string | null;
  smokingAllowed?: boolean | null;
  partiesAllowed?: boolean | null;
  additionalRules?: string[] | null;
}

export interface PolicySpan {
  _type: string;
  _key?: string;
  text?: string;
  marks?: string[];
}

/** One Portable Text block. The schema only allows normal / h3, bullet lists and strong; anything else is read as plain text. */
export interface PolicyBlock {
  _type: string;
  _key?: string;
  style?: string;
  listItem?: string;
  level?: number;
  children?: PolicySpan[];
}

export type PolicyKind =
  | "cancellation"
  | "booking"
  | "pets"
  | "damage"
  | "checkIn"
  | "guestRefund"
  | "payment";

export interface StayPolicy {
  _id: string;
  title: string;
  slug?: string | null;
  kind: PolicyKind;
  summary?: string | null;
  body?: PolicyBlock[] | null;
}

export interface StayHost {
  _id: string;
  name: string;
  bio?: string | null;
  isSuperhost?: boolean | null;
  /** ISO date, "2018-05-01". */
  hostingSince?: string | null;
  responseTime?: string | null;
  languages?: string[] | null;
  /** Sanity image URL. No host has one yet: the avatar shows an initial. */
  photoUrl?: string | null;
}

/** One stay, read by slug for the details screen. */
export interface StayDetails extends Omit<Stay, "houseRules"> {
  cleaningFee?: number | null;
  minNights?: number | null;
  houseRules: HouseRules;
  host?: StayHost | null;
  cancellationPolicy?: StayPolicy | null;
  /** Roam's other policies (everything that is not a cancellation policy). */
  policies: StayPolicy[];
}
