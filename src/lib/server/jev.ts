// src/lib/server/jev.ts
// Reads the guest's sentence with Jev (typed decisions through the AI SDK) and turns its probabilities into a
// SearchIntent by fixed thresholds. One request carries every question; Jev never produces a value, only chooses
// among options. If Jev fails for any reason, the regex parser reads the sentence instead.
import { typeSafeAi } from "@ai-sdk/typesafe-ai";
import { experimental_decide as decide, type Experimental_DecisionQuestion } from "ai";

import {
  AMENITIES,
  PETS_FEATURE,
  PROPERTY_TYPES,
  VIBE_FEATURES,
  cleanSentence,
  emptyIntent,
  intentFromParsed,
  type SearchIntent,
  type Weighted,
} from "@/lib/search/intent";
import { parseSearchQuery, takePlace } from "@/lib/search/parse";
import type { Amenity, PropertyType } from "@/lib/stays";

// ------------------------------------------------------------------ policy (tunable)

export const POLICY = {
  /** An amenity, type or pets stance at or above this P(wanted) / P(avoided) becomes a filter. */
  filter: 0.9,
  /** Below that, a preference at or above this ranks (boosts). */
  boost: 0.3,
  /** A vibe at or above this P(avoided) is demoted. */
  vibeAvoid: 0.8,
  /** A number's role counts at or above this probability. */
  numberRole: 0.6,
} as const;

type Stance = "wanted" | "implied" | "avoided" | "not_mentioned";
export type Probs = Partial<Record<Stance, number>>;

/** pref = P(wanted) + 0.5 x P(implied). */
export const preference = (p: Probs) => (p.wanted ?? 0) + 0.5 * (p.implied ?? 0);

export type Role = { role: "required" | "avoided" | "preferred" | "none"; weight: number };

const round2 = (n: number) => Math.round(Math.min(1, Math.max(0, n)) * 100) / 100;

/** Amenity, type or pets: filter only when sure, otherwise rank. */
export function filterRole(p: Probs): Role {
  if ((p.wanted ?? 0) >= POLICY.filter) return { role: "required", weight: 1 };
  if ((p.avoided ?? 0) >= POLICY.filter) return { role: "avoided", weight: 1 };
  const pref = preference(p);
  return pref >= POLICY.boost ? { role: "preferred", weight: round2(pref) } : { role: "none", weight: 0 };
}

/** A vibe never filters: it boosts, or is demoted. */
export function vibeRole(p: Probs): Role {
  if ((p.avoided ?? 0) >= POLICY.vibeAvoid) return { role: "avoided", weight: round2(p.avoided ?? 0) };
  const pref = preference(p);
  return pref >= POLICY.boost ? { role: "preferred", weight: round2(pref) } : { role: "none", weight: 0 };
}

// ------------------------------------------------------------------ numbers

const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
  eighteen: 18, nineteen: 19, twenty: 20,
};

export type NumberCandidate = {
  /** As written: "$300", "1,200", "1.5k", "four". */
  number: string;
  /** Which time this same text appears in the sentence (1 for the first). */
  occurrence: number;
  value: number;
};

/** Digits ($300, 1,200, 1.5k) and the number words one to twenty, in order. Code finds them; Jev says what they mean. */
export function findNumbers(sentence: string, max = 8): NumberCandidate[] {
  const re = new RegExp(
    `(?<![\\w.])\\$?\\d+(?:,\\d{3})*(?:\\.\\d+)?k?(?!\\w)|\\b(?:${Object.keys(NUMBER_WORDS).join("|")})\\b`,
    "gi",
  );
  const seen = new Map<string, number>();
  const out: NumberCandidate[] = [];
  for (const m of sentence.matchAll(re)) {
    const token = m[0];
    const value = parseNumber(token);
    if (value === null) continue;
    const key = token.toLowerCase();
    const occurrence = (seen.get(key) ?? 0) + 1;
    seen.set(key, occurrence);
    out.push({ number: token, occurrence, value });
    if (out.length === max) break;
  }
  return out;
}

export function parseNumber(token: string): number | null {
  const t = token.toLowerCase().replace(/[$,]/g, "");
  if (t in NUMBER_WORDS) return NUMBER_WORDS[t];
  const k = t.endsWith("k");
  const n = Number(k ? t.slice(0, -1) : t);
  if (!Number.isFinite(n)) return null;
  return k ? n * 1000 : n;
}

type NumberRole = "maxPrice" | "minPrice" | "guests" | "bedrooms";
const ROLES: NumberRole[] = ["maxPrice", "minPrice", "guests", "bedrooms"];

const BOUNDS: Record<NumberRole, { min: number; max: number; integer: boolean }> = {
  maxPrice: { min: 1, max: 100000, integer: false },
  minPrice: { min: 1, max: 100000, integer: false },
  guests: { min: 1, max: 50, integer: true },
  bedrooms: { min: 1, max: 20, integer: true },
};

/**
 * One answer per candidate (its probability for each role, or `other`). A role is used at P >= 0.6; when two
 * numbers get the same role the higher probability wins; the winner's value must be in bounds, or the role is
 * ignored. Jev never produces a value: it comes from the sentence.
 */
export function numbersFromAnswers(
  candidates: NumberCandidate[],
  answers: Record<string, number>[],
): Partial<Record<NumberRole, number>> {
  const best: Partial<Record<NumberRole, { p: number; value: number }>> = {};
  candidates.forEach((c, i) => {
    const probs = answers[i] ?? {};
    for (const role of ROLES) {
      const p = probs[role] ?? 0;
      if (p < POLICY.numberRole) continue;
      if (!best[role] || p > best[role]!.p) best[role] = { p, value: c.value };
    }
  });
  const out: Partial<Record<NumberRole, number>> = {};
  for (const role of ROLES) {
    const b = best[role];
    if (!b) continue;
    const { min, max, integer } = BOUNDS[role];
    if (b.value < min || b.value > max || (integer && !Number.isInteger(b.value))) continue;
    out[role] = b.value;
  }
  return out;
}

// ------------------------------------------------------------------ questions

const STANCE_CRITERIA = {
  wanted: "The guest asks for this by name or with words that can only mean it.",
  implied: "The guest does not ask for it, but it fits what they describe.",
  avoided: "The guest says they do not want it or cannot have it.",
  not_mentioned: "Nothing in the sentence is about it.",
} as const;

const NUMBER_CRITERIA = {
  maxPrice: "The most the guest will pay per night.",
  minPrice: "The least the guest wants to pay per night.",
  guests: "How many people are staying.",
  bedrooms: "How many bedrooms the guest needs.",
  other: "Nights, dates, distance, names, or anything else.",
} as const;

const stance = (feature: string): Experimental_DecisionQuestion => ({
  type: "choice",
  instructions: { task: "How does the guest's search sentence treat this feature of a rental stay?", feature },
  criteria: STANCE_CRITERIA,
});

/** Question ids. One per filter: pets, every amenity, every type, every vibe. */
const PETS_ID = "pets";
const amenityId = (a: string) => `amenity:${a}`;
const typeId = (t: string) => `type:${t}`;
const vibeId = (v: string) => `vibe:${v}`;
const numberId = (i: number) => `number:${i}`;

export function buildQuestions(candidates: NumberCandidate[]): Record<string, Experimental_DecisionQuestion> {
  const q: Record<string, Experimental_DecisionQuestion> = {};
  q[PETS_ID] = stance(PETS_FEATURE);
  for (const a of AMENITIES) q[amenityId(a.value)] = stance(a.feature);
  for (const t of PROPERTY_TYPES) q[typeId(t.value)] = stance(t.feature);
  for (const v of VIBE_FEATURES) q[vibeId(v.value)] = stance(v.feature);
  candidates.forEach((c, i) => {
    q[numberId(i)] = {
      type: "choice",
      instructions: {
        task: "What does this number in the guest's search sentence mean?",
        number: c.number,
        occurrence: c.occurrence,
      },
      criteria: NUMBER_CRITERIA,
    };
  });
  return q;
}

// ------------------------------------------------------------------ answers -> intent

export type Answer = { choice?: string; probabilities?: Record<string, number> };

/** The probabilities, or all of the weight on the chosen option when the provider sent none. */
const probsOf = (a: Answer | undefined): Record<string, number> =>
  a?.probabilities ?? (a?.choice ? { [a.choice]: 1 } : {});

const byWeight = <T,>(xs: Weighted<T>[]) => [...xs].sort((a, b) => b.weight - a.weight);

/** Pure: the sentence, the place found in code, Jev's answers and the number candidates -> the intent. */
export function intentFromAnswers(
  text: string,
  place: string | undefined,
  answers: Record<string, Answer | undefined>,
  candidates: NumberCandidate[],
): SearchIntent {
  const intent = emptyIntent(text);
  intent.source = "jev";
  if (place) intent.place = place;

  for (const a of AMENITIES) {
    const r = filterRole(probsOf(answers[amenityId(a.value)]) as Probs);
    const v = a.value as Amenity;
    if (r.role === "required") intent.amenities.required.push(v);
    else if (r.role === "avoided") intent.amenities.avoided.push(v);
    else if (r.role === "preferred") intent.amenities.preferred.push({ value: v, weight: r.weight });
  }
  for (const t of PROPERTY_TYPES) {
    const r = filterRole(probsOf(answers[typeId(t.value)]) as Probs);
    const v = t.value as PropertyType;
    if (r.role === "required") intent.types.required.push(v);
    else if (r.role === "avoided") intent.types.avoided.push(v);
    else if (r.role === "preferred") intent.types.preferred.push({ value: v, weight: r.weight });
  }
  for (const v of VIBE_FEATURES) {
    const r = vibeRole(probsOf(answers[vibeId(v.value)]) as Probs);
    if (r.role === "avoided") intent.vibes.avoided.push(v.value);
    else if (r.role === "preferred") intent.vibes.preferred.push({ value: v.value, weight: r.weight });
  }
  const pets = filterRole(probsOf(answers[PETS_ID]) as Probs);
  if (pets.role === "required") intent.pets = "wanted";
  else if (pets.role === "avoided") intent.pets = "avoided";
  else if (pets.role === "preferred") intent.petsWeight = pets.weight;

  intent.amenities.preferred = byWeight(intent.amenities.preferred);
  intent.types.preferred = byWeight(intent.types.preferred);
  intent.vibes.preferred = byWeight(intent.vibes.preferred);

  const nums = numbersFromAnswers(
    candidates,
    candidates.map((_, i) => probsOf(answers[numberId(i)])),
  );
  Object.assign(intent, nums);
  return intent;
}

// ------------------------------------------------------------------ the entry point

type Decide = typeof decide;

/**
 * Reads the sentence. Place stays in code (`takePlace`); Jev judges everything else in one request.
 * On any error (network, 4xx/5xx, missing key) it logs the error's name only, never the sentence, and returns
 * the regex parser's reading with source "parser". An empty sentence needs no model.
 */
export async function readIntent(
  sentence: string,
  places: string[],
  deps: { decide?: Decide } = {},
): Promise<SearchIntent> {
  const text = cleanSentence(sentence);
  if (!text) return emptyIntent("");

  try {
    const { place } = takePlace(text, places);
    const candidates = findNumbers(text);
    const result = await (deps.decide ?? decide)({
      model: typeSafeAi.decisionModel("jev-latest"),
      state: { sentence: text },
      questions: buildQuestions(candidates),
      maxRetries: 1,
      abortSignal: AbortSignal.timeout(8000),
    });
    return intentFromAnswers(text, place, result.answers as Record<string, Answer>, candidates);
  } catch (err) {
    console.warn("jev fallback", err instanceof Error ? err.name : "unknown");
    return intentFromParsed(parseSearchQuery(text, places));
  }
}
