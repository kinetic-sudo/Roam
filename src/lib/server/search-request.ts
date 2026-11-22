// src/lib/server/search-request.ts
// The body of POST /api/search, validated before anything is built from it. Server-only, so zod stays out of the
// app bundle. A client intent is untrusted: every enum, number and weight is checked here, and place values are
// checked by the route against the known places.
import { z } from "zod";

import { AMENITIES, MAX_TEXT, PROPERTY_TYPES, VIBES } from "@/lib/search/intent";

const types = PROPERTY_TYPES.map((t) => t.value) as [string, ...string[]];
const amenities = AMENITIES.map((a) => a.value) as [string, ...string[]];
const vibes = [...VIBES] as [string, ...string[]];

const weight = z.number().min(0).max(1);
const weighted = (values: [string, ...string[]]) =>
  z.object({ value: z.enum(values), weight }).strict();
const bucket = (values: [string, ...string[]]) =>
  z
    .object({
      required: z.array(z.enum(values)).max(values.length),
      avoided: z.array(z.enum(values)).max(values.length),
      preferred: z.array(weighted(values)).max(values.length),
    })
    .strict();

export const sortSchema = z.enum(["best", "price-asc", "price-desc", "rating"]);

export const intentSchema = z
  .object({
    text: z.string().max(MAX_TEXT),
    source: z.enum(["jev", "parser"]),
    place: z.string().min(1).max(80).optional(),
    maxPrice: z.number().min(1).max(100000).optional(),
    minPrice: z.number().min(1).max(100000).optional(),
    guests: z.number().int().min(1).max(50).optional(),
    bedrooms: z.number().int().min(1).max(20).optional(),
    pets: z.enum(["wanted", "avoided"]).optional(),
    petsWeight: weight.optional(),
    types: bucket(types),
    amenities: bucket(amenities),
    vibes: z
      .object({
        preferred: z.array(weighted(vibes)).max(vibes.length),
        avoided: z.array(z.enum(vibes)).max(vibes.length),
      })
      .strict(),
  })
  .strict();

export const searchRequestSchema = z.union([
  z.object({ q: z.string().max(5000), sort: sortSchema.default("best") }).strict(),
  z.object({ intent: intentSchema, sort: sortSchema.default("best") }).strict(),
]);

export type SearchRequestBody = z.infer<typeof searchRequestSchema>;
