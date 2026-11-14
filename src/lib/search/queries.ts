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
 * One stay by `$slug`, plus Roam's non-cancellation policies. `stay` is null when the slug matches nothing.
 * `houseRules` is built field by field so it is never null and `petsAllowed` is always a boolean.
 */
export const STAY_QUERY = `{
  "stay": *[_type == "property" && slug.current == $slug][0]{
    _id, title, slug, type, pricePerNight, cleaningFee, minNights, maxGuests, rating, reviewCount,
    city, region, country, neighborhood, amenities, summary,
    "photos": photos[]{ alt, asset->{ url } },
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
