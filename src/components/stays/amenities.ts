import type { IconName } from "@/components/ui";
import type { Amenity, Property } from "@/data/properties";
import type { ParsedQuery } from "@/lib/search/parse";

export type Tag = { key: string; label: string; icon: IconName };

const META: Record<Amenity | "pets", Tag> = {
  "hot tub": {
    key: "hot tub",
    label: "Hot Tub",
    icon: { ios: "bathtub", android: "hot_tub", web: "hot_tub" },
  },
  pool: {
    key: "pool",
    label: "Pool",
    icon: { ios: "figure.pool.swim", android: "pool", web: "pool" },
  },
  fireplace: {
    key: "fireplace",
    label: "Fireplace",
    icon: { ios: "flame", android: "fireplace", web: "fireplace" },
  },
  wifi: {
    key: "wifi",
    label: "Wifi",
    icon: { ios: "wifi", android: "wifi", web: "wifi" },
  },
  kitchen: {
    key: "kitchen",
    label: "Kitchen",
    icon: { ios: "fork.knife", android: "kitchen", web: "kitchen" },
  },
  sauna: {
    key: "sauna",
    label: "Sauna",
    icon: { ios: "thermometer.sun", android: "sauna", web: "sauna" },
  },
  "ocean view": {
    key: "ocean view",
    label: "Ocean View",
    icon: { ios: "water.waves", android: "waves", web: "waves" },
  },
  "lake view": {
    key: "lake view",
    label: "Lake View",
    icon: { ios: "water.waves", android: "waves", web: "waves" },
  },
  "mountain view": {
    key: "mountain view",
    label: "Mountain View",
    icon: { ios: "mountain.2", android: "landscape", web: "landscape" },
  },
  bbq: {
    key: "bbq",
    label: "BBQ",
    icon: { ios: "flame", android: "outdoor_grill", web: "outdoor_grill" },
  },
  gym: {
    key: "gym",
    label: "Gym",
    icon: { ios: "dumbbell", android: "fitness_center", web: "fitness_center" },
  },
  parking: {
    key: "parking",
    label: "Parking",
    icon: { ios: "car", android: "local_parking", web: "local_parking" },
  },
  pets: {
    key: "pets",
    label: "Pet Friendly",
    icon: { ios: "pawprint", android: "pets", web: "pets" },
  },
};

// What a row highlights when the guest didn't ask for anything specific.
const DEFAULT_ORDER: (Amenity | "pets")[] = [
  "hot tub",
  "pool",
  "sauna",
  "fireplace",
  "ocean view",
  "lake view",
  "mountain view",
  "pets",
  "bbq",
  "gym",
  "kitchen",
  "parking",
  "wifi",
];

/** Up to two tags per row: what the guest asked for first, then the stay's best features. */
export function highlightTags(p: Property, q: ParsedQuery, max = 2): Tag[] {
  const has = (k: Amenity | "pets") =>
    k === "pets" ? p.petsAllowed : p.amenities.includes(k);
  const wanted: (Amenity | "pets")[] = [
    ...q.amenities,
    ...(q.pets ? (["pets"] as const) : []),
  ];
  const ordered = [...wanted, ...DEFAULT_ORDER].filter(
    (k, i, all) => all.indexOf(k) === i && has(k),
  );
  return ordered.slice(0, max).map((k) => META[k]);
}
