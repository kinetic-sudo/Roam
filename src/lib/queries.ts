// src/lib/queries.ts
// GROQ for the Home grid and the stay details screen. Values reach the query as params, never by interpolation.

/** Home: every stay, best first. Cover photo only. */
export const HOME_QUERY = `*[_type == "property"] | order(rating desc, reviewCount desc, _id asc)[0...60]{
  _id, title, slug, type, pricePerNight, rating, reviewCount,
  "photos": photos[0...1]{ alt, asset->{ url } },
  city, region, country
}`;

const POLICY = `{ _id, title, "slug": slug.current, kind, summary, body }`;

/**
 * One stay by `$slug` (its slug, or its `_id` when it has no slug), plus Roam's non-cancellation policies.
 * `stay` is null when nothing matches. Empty fields are filled in here and again in `normalizeStay`, so a stay
 * added by hand in Studio (no photos, no amenities, no rating yet) still opens.
 * `houseRules` is built field by field so it is never null and `petsAllowed` is always a boolean.
 */
export const STAY_QUERY = `{
  "stay": *[_type == "property" && (slug.current == $slug || _id == $slug)][0]{
    _id, title, type, cleaningFee, minNights, bedrooms, beds, bathrooms,
    "slug": coalesce(slug, { "current": _id }),
    "pricePerNight": coalesce(pricePerNight, 0),
    "maxGuests": coalesce(maxGuests, 0),
    "rating": coalesce(rating, 0),
    "reviewCount": coalesce(reviewCount, 0),
    city, region, country, neighborhood, summary, highlights,
    "amenities": coalesce(amenities, []),
    "photos": coalesce(photos[]{ alt, asset->{ url } }, []),
    "houseRules": {
      "petsAllowed": coalesce(houseRules.petsAllowed, false),
      "maxPets": houseRules.maxPets,
      "petFee": houseRules.petFee,
      "checkInTime": houseRules.checkInTime,
      "checkOutTime": houseRules.checkOutTime,
      "quietHoursFrom": houseRules.quietHoursFrom,
      "quietHoursTo": houseRules.quietHoursTo,
      "smokingAllowed": houseRules.smokingAllowed,
      "partiesAllowed": houseRules.partiesAllowed,
      "additionalRules": houseRules.additionalRules
    },
    "host": host->{ _id, name, bio, isSuperhost, hostingSince, responseTime, languages, "photoUrl": photo.asset->url },
    "cancellationPolicy": cancellationPolicy->${POLICY}
  },
  "policies": *[_type == "policy" && kind != "cancellation"]${POLICY}
}`;
