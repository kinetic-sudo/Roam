// src/lib/search/parse.ts
import { Amenity, PropertyType } from "../stays";

export interface ParsedQuery {
  type?: PropertyType;
  maxPrice?: number;
  guests?: number;
  pets?: boolean;
  amenities: Amenity[];
  place?: string;
  placeAlt?: string;
  vibes: string[];
  rawText: string;
}

const US_STATES: Record<string, string> = {
  california: "CA",
  "new york": "NY",
  texas: "TX",
  florida: "FL",
  washington: "WA",
  oregon: "OR",
  colorado: "CO",
  // Add other states as needed
};

const AMENITY_KEYWORDS: Record<string, Amenity> = {
  "hot tub": "hotTub",
  pool: "pool",
  fireplace: "fireplace",
  "fire pit": "firePit",
  sauna: "sauna",
  wifi: "wifi",
  kitchen: "kitchen",
  workspace: "workspace",
  parking: "parking",
  washer: "washer",
  ac: "ac",
  "ocean view": "oceanView",
  "lake view": "lakeView",
  "beach access": "beachAccess",
  "mountain view": "mountainView",
  bbq: "bbq",
  "ev charger": "evCharger",
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

export function parseSearchQuery(queryText: string): ParsedQuery {
  const text = queryText.toLowerCase();
  const parsed: ParsedQuery = {
    amenities: [],
    vibes: [],
    rawText: queryText,
  };

  // Price parsing: "under $300" or "< 300"
  const priceMatch = text.match(/(?:under|\<)\s*\$?(\d+)/);
  if (priceMatch) {
    parsed.maxPrice = parseInt(priceMatch[1], 10);
  }

  // Guests parsing: "for 4", "4 guests"
  const guestMatch = text.match(/(?:for\s*)?(\d+)\s*(?:guests?|people|person)/);
  if (guestMatch) {
    parsed.guests = parseInt(guestMatch[1], 10);
  }

  // Pets parsing
  if (
    text.includes("pet friendly") ||
    text.includes("pets allowed") ||
    text.includes("dogs allowed")
  ) {
    parsed.pets = true;
  }

  // Type parsing
  const types: PropertyType[] = [
    "cabin",
    "beach",
    "city",
    "villa",
    "house",
    "apartment",
  ];
  for (const t of types) {
    if (text.includes(t)) {
      parsed.type = t;
      break;
    }
  }

  // Amenity parsing
  for (const [kw, amenity] of Object.entries(AMENITY_KEYWORDS)) {
    if (text.includes(kw)) {
      if (!parsed.amenities.includes(amenity)) {
        parsed.amenities.push(amenity);
      }
    }
  }

  // Place parsing ("in/near X" or state/country match)
  const placeMatch = text.match(
    /(?:in|near)\s+([a-zA-Z\s]+?)(?=\s+(?:under|for|with|\$)|$)/,
  );
  if (placeMatch) {
    const placeName = placeMatch[1].trim();
    parsed.place = placeName;
    if (US_STATES[placeName]) {
      parsed.placeAlt = US_STATES[placeName];
    }
  } else {
    // Check direct state/country matches
    for (const [stateName, code] of Object.entries(US_STATES)) {
      if (text.includes(stateName)) {
        parsed.place = stateName;
        parsed.placeAlt = code;
        break;
      }
    }
  }

  // Vibe extraction
  const words = text.replace(/[^\w\s]/g, "").split(/\s+/);
  for (const word of words) {
    if (VIBE_WORDS.has(word) && !parsed.vibes.includes(word)) {
      parsed.vibes.push(word);
    }
  }

  return parsed;
}
