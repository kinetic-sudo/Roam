// src/lib/stay-details.ts
// Pure helpers for the stay details screen. No network, no React: easy to test.
import type { HouseRules, StayDetails, StayHost, StayPolicy } from "./stays";

/** "15:00" -> "3:00 PM". Anything that is not HH:MM comes back unchanged. */
export function formatTime(value: string): string {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!m) return value;
  const h = Number(m[1]);
  const min = m[2];
  if (h > 23 || Number(min) > 59) return value;
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 === 0 ? 12 : h % 12}:${min} ${suffix}`;
}

const has = (v: string | null | undefined): v is string => !!v && v.trim().length > 0;

export type HouseRuleKey = "checkIn" | "checkOut" | "quiet" | "pets" | "smoking" | "parties" | "extra";

/** The house rules as keyed lines, so a caller can pick "the pets line" without matching strings. */
export function houseRuleParts(rules: HouseRules): { key: HouseRuleKey; text: string }[] {
  const out: { key: HouseRuleKey; text: string }[] = [];
  const add = (key: HouseRuleKey, text: string) => out.push({ key, text });

  if (has(rules.checkInTime)) add("checkIn", `Check-in after ${formatTime(rules.checkInTime)}`);
  if (has(rules.checkOutTime)) add("checkOut", `Checkout before ${formatTime(rules.checkOutTime)}`);
  if (has(rules.quietHoursFrom) && has(rules.quietHoursTo))
    add("quiet", `Quiet hours ${formatTime(rules.quietHoursFrom)} to ${formatTime(rules.quietHoursTo)}`);

  if (rules.petsAllowed) {
    const parts = ["Pets allowed"];
    if (rules.maxPets != null) parts.push(`up to ${rules.maxPets}`);
    if (rules.petFee != null) parts.push(`$${rules.petFee} pet fee per stay`);
    add("pets", parts.join(", "));
  } else {
    add("pets", "No pets");
  }

  if (rules.smokingAllowed != null) add("smoking", rules.smokingAllowed ? "Smoking allowed" : "No smoking");
  if (rules.partiesAllowed != null) add("parties", rules.partiesAllowed ? "Parties allowed" : "No parties or events");

  for (const rule of rules.additionalRules ?? []) if (has(rule)) add("extra", rule);
  return out;
}

/** One line per rule, in the order the spec lists them. Rules the host did not set are left out. */
export const houseRuleLines = (rules: HouseRules): string[] => houseRuleParts(rules).map((p) => p.text);

/** `pricePerNight × minNights + (cleaningFee ?? 0)`. Until dates exist, a stay is priced at its minimum. */
export function stayTotal(
  stay: Pick<StayDetails, "pricePerNight" | "minNights" | "cleaningFee">,
): { nights: number; total: number } {
  const nights = Math.max(1, stay.minNights ?? 1);
  return { nights, total: stay.pricePerNight * nights + (stay.cleaningFee ?? 0) };
}

/** 1234 -> "$1,234" */
export const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

/** "$673 total · 2 nights" / "$289 total · 1 night" */
export function totalLabel(stay: Pick<StayDetails, "pricePerNight" | "minNights" | "cleaningFee">): string {
  const { nights, total } = stayTotal(stay);
  return `${money(total)} total · ${nights} ${nights === 1 ? "night" : "nights"}`;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "2018-05-01" -> "May 2018". Read from the string so a time zone can never shift the month. */
export function monthYear(date: string): string | null {
  const m = /^(\d{4})-(\d{2})/.exec(date);
  if (!m) return null;
  const month = MONTHS[Number(m[2]) - 1];
  return month ? `${month} ${m[1]}` : null;
}

/** ["English"] -> "English", two -> "A and B", more -> "A, B and C". */
export function joinList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** The host sheet's text. Fields that are missing are left out. */
export function hostFacts(host: StayHost): { bio: string | null; lines: string[] } {
  const lines: string[] = [];
  const since = host.hostingSince ? monthYear(host.hostingSince) : null;
  if (since) lines.push(`Hosting since ${since}`);
  if (has(host.responseTime)) lines.push(`Responds ${host.responseTime}`);
  const languages = (host.languages ?? []).filter(has);
  if (languages.length > 0) lines.push(`Speaks ${joinList(languages)}`);
  return { bio: has(host.bio) ? host.bio : null, lines };
}

/** "Maya Chen" -> "Maya" */
export const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;

/** Roam's other policies in the order the spec gives. Unknown kinds go last, in their query order. */
const POLICY_ORDER = ["checkIn", "pets", "payment", "booking", "damage", "guestRefund"];
export function sortPolicies<T extends { kind: string }>(policies: T[]): T[] {
  const rank = (k: string) => {
    const i = POLICY_ORDER.indexOf(k);
    return i === -1 ? POLICY_ORDER.length : i;
  };
  return policies
    .map((p, i) => ({ p, i }))
    .sort((a, b) => rank(a.p.kind) - rank(b.p.kind) || a.i - b.i)
    .map((x) => x.p);
}

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** "6 guests", "3 bedrooms", "4 beds", "2.5 baths": the quick facts under the place. Missing or zero ones are left out. */
export function stayFacts(
  stay: Pick<StayDetails, "maxGuests" | "bedrooms" | "beds" | "bathrooms">,
): string[] {
  const out: string[] = [];
  if (stay.maxGuests > 0) out.push(count(stay.maxGuests, "guest", "guests"));
  if (stay.bedrooms) out.push(count(stay.bedrooms, "bedroom", "bedrooms"));
  if (stay.beds) out.push(count(stay.beds, "bed", "beds"));
  if (stay.bathrooms) out.push(count(stay.bathrooms, "bath", "baths"));
  return out;
}

/**
 * Fills in what a stay may be missing, so no screen has to guard each field: a stay added by hand in Studio can
 * have no slug, photos, amenities, rating or house rules yet. Opens the stay instead of crashing on it.
 */
export function normalizeStay(
  raw: Omit<StayDetails, "policies">,
  policies: StayPolicy[] | null | undefined,
): StayDetails {
  return {
    ...raw,
    slug: raw.slug?.current ? raw.slug : { current: raw._id },
    amenities: raw.amenities ?? [],
    photos: raw.photos ?? [],
    pricePerNight: raw.pricePerNight ?? 0,
    maxGuests: raw.maxGuests ?? 0,
    rating: raw.rating ?? 0,
    reviewCount: raw.reviewCount ?? 0,
    houseRules: raw.houseRules
      ? { ...raw.houseRules, petsAllowed: raw.houseRules.petsAllowed ?? false }
      : { petsAllowed: false },
    policies: policies ?? [],
  };
}
