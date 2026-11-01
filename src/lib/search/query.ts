// src/lib/search/query.ts
import { Amenity, Stay } from "../stays";
import { ParsedQuery } from "./parse";

export type SortOption = "best" | "price-asc" | "price-desc" | "rating";

export function buildSearchQuery(parsed: ParsedQuery, sort: SortOption) {
  const filters: string[] = ['_type == "stay"'];
  const params: Record<string, any> = {};

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

  if (parsed.pets) {
    filters.push("houseRules.petsAllowed == true");
  }

  if (parsed.amenities.length > 0) {
    filters.push("count(amenities[@ in $amenities]) == count($amenities)");
    params.amenities = parsed.amenities;
  }

  if (parsed.place) {
    filters.push(
      "(lower(city) == $place || lower(region) == $place || lower(country) == $place || lower(neighborhood) == $place || region == $placeAlt)",
    );
    params.place = parsed.place.toLowerCase();
    params.placeAlt = parsed.placeAlt || "";
  }

  const filterString = filters.join(" && ");

  // Sorting & Scoring
  let orderClause = "order(rating desc, reviewCount desc)";
  if (sort === "price-asc")
    orderClause = "order(pricePerNight asc, rating desc)";
  if (sort === "price-desc")
    orderClause = "order(pricePerNight desc, rating desc)";
  if (sort === "rating") orderClause = "order(rating desc, reviewCount desc)";

  let query: string;
  if (parsed.vibes.length > 0 && sort === "best") {
    const boosts = parsed.vibes
      .map((vibe, i) => {
        params[`vibe${i}`] = vibe;
        return `boost(vibes match $vibe${i}, 3), boost([title, summary, description, highlights, neighborhood] match $vibe${i}, 1)`;
      })
      .join(", ");

    query = `{
      "total": count(*[${filterString}]),
      "stays": *[${filterString}] | score(${boosts}) | order(_score desc, rating desc, reviewCount desc)[0...50]{
        _id, title, slug, type, pricePerNight, maxGuests, rating, reviewCount, photos, city, region, country, amenities, houseRules
      }
    }`;
  } else {
    query = `{
      "total": count(*[${filterString}]),
      "stays": *[${filterString}] | ${orderClause}[0...50]{
        _id, title, slug, type, pricePerNight, maxGuests, rating, reviewCount, photos, city, region, country, amenities, houseRules
      }
    }`;
  }

  return { query, params };
}

export function chipsFor(parsed: ParsedQuery) {
  const chips: Array<{
    id: string;
    label: string;
    active: boolean;
    type: string;
  }> = [];

  if (parsed.type) {
    chips.push({
      id: "type",
      label: parsed.type.charAt(0).toUpperCase() + parsed.type.slice(1) + "s",
      active: true,
      type: "type",
    });
  }
  if (parsed.maxPrice) {
    chips.push({
      id: "price",
      label: `Under $${parsed.maxPrice}`,
      active: true,
      type: "price",
    });
  }
  if (parsed.guests) {
    chips.push({
      id: "guests",
      label: `${parsed.guests}+ guests`,
      active: true,
      type: "guests",
    });
  }
  if (parsed.pets) {
    chips.push({
      id: "pets",
      label: "Pet Friendly",
      active: true,
      type: "pets",
    });
  }
  for (const am of parsed.amenities) {
    chips.push({
      id: `am-${am}`,
      label: am.replace(/([A-Z])/g, " $1").trim(),
      active: true,
      type: "amenity",
    });
  }
  for (const vibe of parsed.vibes) {
    chips.push({
      id: `vibe-${vibe}`,
      label: vibe.charAt(0).toUpperCase() + vibe.slice(1),
      active: true,
      type: "vibe",
    });
  }

  // Suggestions
  const suggestions = [
    "Under $300",
    "Pet Friendly",
    "Quiet",
    "Hot Tub",
    "Pool",
    "Fireplace",
  ];
  for (const sug of suggestions) {
    if (sug === "Under $300" && parsed.maxPrice) continue;
    if (sug === "Pet Friendly" && parsed.pets) continue;
    if (!chips.some((c) => c.label.toLowerCase() === sug.toLowerCase())) {
      chips.push({
        id: `sug-${sug}`,
        label: sug,
        active: false,
        type: "suggestion",
      });
    }
  }

  return chips;
}

export function toggleChip(
  parsed: ParsedQuery,
  chipId: string,
  label: string,
): ParsedQuery {
  const next = {
    ...parsed,
    amenities: [...parsed.amenities],
    vibes: [...parsed.vibes],
  };
  if (chipId === "type") delete next.type;
  else if (chipId === "price") delete next.maxPrice;
  else if (chipId === "guests") delete next.guests;
  else if (chipId === "pets") delete next.pets;
  else if (chipId.startsWith("am-")) {
    const am = chipId.replace("am-", "") as Amenity;
    next.amenities = next.amenities.filter((a) => a !== am);
  } else if (chipId.startsWith("vibe-")) {
    const vibe = chipId.replace("vibe-", "");
    next.vibes = next.vibes.filter((v) => v !== vibe);
  } else if (chipId.startsWith("sug-")) {
    if (label === "Under $300") next.maxPrice = 300;
    else if (label === "Pet Friendly") next.pets = true;
    else if (label === "Hot Tub") next.amenities.push("hotTub");
    else if (label === "Pool") next.amenities.push("pool");
    else if (label === "Fireplace") next.amenities.push("fireplace");
    else if (label === "Quiet") next.vibes.push("quiet");
  }
  return next;
}

export function matchTags(
  stay: Stay,
  parsed: ParsedQuery,
): Array<{ label: string; icon: string }> {
  const tags: Array<{ label: string; icon: string }> = [];
  const priorityAmenities: Amenity[] = [
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

  for (const am of stay.amenities) {
    if (parsed.amenities.includes(am) || priorityAmenities.includes(am)) {
      tags.push({
        label: am.replace(/([A-Z])/g, " $1").trim(),
        icon: amenityIcon(am),
      });
      if (tags.length >= 2) return tags;
    }
  }

  if (stay.houseRules.petsAllowed && (parsed.pets || tags.length < 2)) {
    tags.push({ label: "Pet Friendly", icon: "paw" });
    if (tags.length >= 2) return tags;
  }

  const fallbacks: Amenity[] = ["workspace", "wifi", "kitchen", "ac"];
  for (const am of fallbacks) {
    if (tags.length < 2 && stay.amenities.includes(am)) {
      tags.push({
        label: am.replace(/([A-Z])/g, " $1").trim(),
        icon: amenityIcon(am),
      });
    }
  }

  return tags;
}

function amenityIcon(am: Amenity): string {
  switch (am) {
    case "hotTub":
      return "bubbles";
    case "pool":
      return "pool";
    case "fireplace":
      return "fireplace";
    case "firePit":
      return "flame";
    case "sauna":
      return "thermometer";
    case "oceanView":
    case "lakeView":
      return "water";
    case "mountainView":
      return "mountain";
    case "beachAccess":
      return "umbrella";
    default:
      return "checkmark";
  }
}
