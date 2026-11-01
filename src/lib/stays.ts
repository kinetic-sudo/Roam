// src/lib/stays.ts
export type PropertyType =
  | "cabin"
  | "beach"
  | "city"
  | "villa"
  | "house"
  | "apartment";

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

export interface Stay {
  _id: string;
  title: string;
  slug: { current: string };
  type: PropertyType;
  pricePerNight: number;
  maxGuests: number;
  rating: number;
  reviewCount: number;
  photos: Array<{ asset: { url: string }; alt?: string }>;
  city: string;
  region: string;
  country: string;
  neighborhood?: string;
  amenities: Amenity[];
  houseRules: {
    petsAllowed: boolean;
  };
  summary?: string;
  description?: string;
  highlights?: string[];
}
