// Local stand-in for Sanity. Keep this shape close to a future Sanity document.
// Photos are Unsplash placeholders: run `node scripts/check-images.mjs` and look at every card.

export type PropertyType = "cabin" | "beach" | "city" | "villa";

export type Amenity =
  | "hot tub"
  | "pool"
  | "fireplace"
  | "wifi"
  | "kitchen"
  | "sauna"
  | "ocean view"
  | "lake view"
  | "mountain view"
  | "bbq"
  | "gym"
  | "parking";

export type Property = {
  id: string;
  title: string;
  type: PropertyType;
  city: string;
  region: string;
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  petsAllowed: boolean;
  amenities: Amenity[];
  vibes: string[];
  description: string;
  imageUrl: string;
};

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

export const properties: Property[] = [
  // ---- cabins ----
  {
    id: "cabin-arrowhead-modern",
    title: "Modern Cabin with Hot Tub",
    type: "cabin",
    city: "Lake Arrowhead",
    region: "CA",
    rating: 4.9,
    reviewCount: 612,
    pricePerNight: 385,
    maxGuests: 6,
    bedrooms: 3,
    petsAllowed: true,
    amenities: ["hot tub", "fireplace", "wifi", "kitchen", "bbq"],
    vibes: ["quiet", "modern", "scenic", "secluded"],
    description:
      "Floor-to-ceiling windows, a cedar hot tub and a fire pit among the pines, ten minutes from the lake.",
    imageUrl: img("1510798831971-661eb04b3739"),
  },
  {
    id: "cabin-bigbear-log",
    title: "Lakeside Log Cabin",
    type: "cabin",
    city: "Big Bear Lake",
    region: "CA",
    rating: 4.8,
    reviewCount: 431,
    pricePerNight: 240,
    maxGuests: 5,
    bedrooms: 2,
    petsAllowed: true,
    amenities: ["hot tub", "fireplace", "kitchen", "wifi", "lake view", "bbq"],
    vibes: ["cozy", "rustic", "quiet", "family"],
    description:
      "A warm log cabin with a stone fireplace, a wraparound deck and a short walk to the water.",
    imageUrl: img("1449158743715-0a90ebb6d2d8"),
  },
  {
    id: "cabin-hemsedal-fjord",
    title: "Fjord View Cabin",
    type: "cabin",
    city: "Hemsedal",
    region: "Norway",
    rating: 4.9,
    reviewCount: 188,
    pricePerNight: 310,
    maxGuests: 4,
    bedrooms: 2,
    petsAllowed: false,
    amenities: ["sauna", "fireplace", "wifi", "mountain view", "kitchen"],
    vibes: ["quiet", "secluded", "scenic", "romantic"],
    description:
      "A turf-roofed cabin above the valley with a wood-fired sauna and long mountain views.",
    imageUrl: img("1470770841072-f978cf4d019e"),
  },
  {
    id: "cabin-whistler-hideaway",
    title: "Ski-In Mountain Hideaway",
    type: "cabin",
    city: "Whistler",
    region: "BC",
    rating: 4.7,
    reviewCount: 356,
    pricePerNight: 295,
    maxGuests: 8,
    bedrooms: 4,
    petsAllowed: true,
    amenities: ["hot tub", "fireplace", "wifi", "kitchen", "parking"],
    vibes: ["cozy", "lively", "family", "ski"],
    description:
      "Four bedrooms, a hot tub on the deck and a boot room by the door, steps from the lifts.",
    imageUrl: img("1542718610-a1d656d1884c"),
  },
  {
    id: "cabin-asheville-pine",
    title: "Pine Forest Retreat",
    type: "cabin",
    city: "Asheville",
    region: "NC",
    rating: 4.6,
    reviewCount: 274,
    pricePerNight: 135,
    maxGuests: 4,
    bedrooms: 1,
    petsAllowed: true,
    amenities: ["fireplace", "wifi", "kitchen"],
    vibes: ["cozy", "quiet", "rustic", "budget"],
    description:
      "A snug one-bedroom in the Blue Ridge woods with a woodstove and a screened porch.",
    imageUrl: img("1587061949409-02df41d5e562"),
  },

  // ---- beach ----
  {
    id: "beach-malibu-oceanfront",
    title: "Oceanfront Beach House",
    type: "beach",
    city: "Malibu",
    region: "CA",
    rating: 4.9,
    reviewCount: 528,
    pricePerNight: 620,
    maxGuests: 8,
    bedrooms: 4,
    petsAllowed: false,
    amenities: ["ocean view", "hot tub", "wifi", "kitchen", "bbq", "parking"],
    vibes: ["scenic", "luxury", "family", "lively"],
    description:
      "Sand on the doorstep, a hot tub on the deck and sunset views from every bedroom.",
    imageUrl: img("1499793983690-e29da59ef1c2"),
  },
  {
    id: "beach-tulum-bungalow",
    title: "Surf Shack Bungalow",
    type: "beach",
    city: "Tulum",
    region: "Mexico",
    rating: 4.7,
    reviewCount: 402,
    pricePerNight: 150,
    maxGuests: 4,
    bedrooms: 1,
    petsAllowed: true,
    amenities: ["ocean view", "wifi", "kitchen"],
    vibes: ["tropical", "lively", "relaxed"],
    description:
      "A thatched bungalow two minutes from the sand, with an outdoor shower and hammocks.",
    imageUrl: img("1507525428034-b723cf961d3e"),
  },
  {
    id: "beach-nagshead-dune",
    title: "Dune Cottage",
    type: "beach",
    city: "Nags Head",
    region: "NC",
    rating: 4.8,
    reviewCount: 390,
    pricePerNight: 275,
    maxGuests: 6,
    bedrooms: 3,
    petsAllowed: true,
    amenities: ["ocean view", "wifi", "kitchen", "bbq", "parking"],
    vibes: ["peaceful", "quiet", "family", "relaxed"],
    description:
      "A breezy shingled cottage on the dunes with an outdoor grill and a private boardwalk to the beach.",
    imageUrl: img("1519046904884-53103b34b206"),
  },
  {
    id: "beach-lagos-cliff",
    title: "Cliffside Beach Retreat",
    type: "beach",
    city: "Lagos",
    region: "Portugal",
    rating: 4.8,
    reviewCount: 233,
    pricePerNight: 210,
    maxGuests: 6,
    bedrooms: 3,
    petsAllowed: false,
    amenities: ["pool", "ocean view", "wifi", "kitchen"],
    vibes: ["scenic", "romantic", "peaceful"],
    description:
      "A whitewashed house above golden cliffs, with a plunge pool and steps down to a hidden cove.",
    imageUrl: img("1520454974749-611b7248ffdb"),
  },

  // ---- city ----
  {
    id: "city-brooklyn-loft",
    title: "Sunny Brooklyn Loft",
    type: "city",
    city: "Brooklyn",
    region: "NY",
    rating: 4.6,
    reviewCount: 719,
    pricePerNight: 139,
    maxGuests: 2,
    bedrooms: 1,
    petsAllowed: false,
    amenities: ["wifi", "kitchen", "gym"],
    vibes: ["modern", "lively", "central", "design"],
    description:
      "Exposed brick, tall windows and a fast walk to the subway, cafes and the waterfront.",
    imageUrl: img("1522708323590-d24dbb6b0267"),
  },
  {
    id: "city-chicago-studio",
    title: "Compact Studio by the L",
    type: "city",
    city: "Chicago",
    region: "IL",
    rating: 4.5,
    reviewCount: 483,
    pricePerNight: 95,
    maxGuests: 2,
    bedrooms: 0,
    petsAllowed: false,
    amenities: ["wifi", "kitchen"],
    vibes: ["central", "modern", "budget"],
    description:
      "A clean, bright studio a block from the train, ideal for a short work trip or a weekend away.",
    imageUrl: img("1502672260266-1c1ef2d93688"),
  },
  {
    id: "city-toronto-penthouse",
    title: "Skyline Penthouse",
    type: "city",
    city: "Toronto",
    region: "ON",
    rating: 4.9,
    reviewCount: 142,
    pricePerNight: 520,
    maxGuests: 4,
    bedrooms: 2,
    petsAllowed: false,
    amenities: ["gym", "wifi", "kitchen", "parking", "hot tub"],
    vibes: ["luxury", "modern", "central", "scenic"],
    description:
      "Two floors of glass above the harbour with a rooftop hot tub and concierge service.",
    imageUrl: img("1493809842364-78817add7ffb"),
  },

  // ---- villas ----
  {
    id: "villa-montepulciano-tuscan",
    title: "Tuscan Hillside Villa",
    type: "villa",
    city: "Montepulciano",
    region: "Italy",
    rating: 4.9,
    reviewCount: 167,
    pricePerNight: 450,
    maxGuests: 10,
    bedrooms: 5,
    petsAllowed: true,
    amenities: ["pool", "kitchen", "wifi", "bbq", "mountain view"],
    vibes: ["quiet", "romantic", "scenic", "luxury"],
    description:
      "A restored stone farmhouse among olive groves, with a long pool and a wood-fired pizza oven.",
    imageUrl: img("1580587771525-78b9dba3b914"),
  },
  {
    id: "villa-ubud-infinity",
    title: "Infinity Pool Villa",
    type: "villa",
    city: "Ubud",
    region: "Bali",
    rating: 4.9,
    reviewCount: 301,
    pricePerNight: 340,
    maxGuests: 6,
    bedrooms: 3,
    petsAllowed: false,
    amenities: ["pool", "wifi", "kitchen", "gym"],
    vibes: ["tropical", "peaceful", "romantic"],
    description:
      "Open-air living above the rice terraces, a private infinity pool and a daily breakfast delivered.",
    imageUrl: img("1512917774080-9991f1c4c750"),
  },
  {
    id: "villa-palmsprings-modern",
    title: "Desert Modern Villa",
    type: "villa",
    city: "Palm Springs",
    region: "CA",
    rating: 4.8,
    reviewCount: 255,
    pricePerNight: 390,
    maxGuests: 8,
    bedrooms: 4,
    petsAllowed: true,
    amenities: ["pool", "hot tub", "wifi", "kitchen", "bbq", "parking"],
    vibes: ["modern", "lively", "luxury"],
    description:
      "Mid-century lines, a saltwater pool and a hot tub facing the San Jacinto mountains.",
    imageUrl: img("1564013799919-ab600027ffc6"),
  },
  {
    id: "villa-oia-clifftop",
    title: "Clifftop Caldera Villa",
    type: "villa",
    city: "Oia",
    region: "Santorini",
    rating: 4.9,
    reviewCount: 98,
    pricePerNight: 850,
    maxGuests: 6,
    bedrooms: 3,
    petsAllowed: false,
    amenities: ["pool", "ocean view", "hot tub", "wifi", "kitchen"],
    vibes: ["romantic", "luxury", "scenic"],
    description:
      "A cave-style villa carved into the cliff, with a private pool and the sunset over the caldera.",
    imageUrl: img("1613490493576-7fde63acd811"),
  },
];
