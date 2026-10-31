import type { SeedStay } from '../seed/stays'

// Code checks for descriptive copy (summary, description, highlights): every claim must trace back to the
// stay's own typed fields, facts and vibes. No LLM involved.

const AMENITY_LABEL: Record<string, string> = {
  hotTub: 'hot tub',
  pool: 'pool',
  fireplace: 'fireplace',
  firePit: 'fire pit',
  sauna: 'sauna',
  wifi: 'wifi',
  kitchen: 'kitchen',
  workspace: 'workspace',
  parking: 'parking',
  washer: 'washer',
  ac: 'air conditioning',
  oceanView: 'ocean view',
  lakeView: 'lake view',
  beachAccess: 'beach access',
  mountainView: 'mountain view',
  bbq: 'bbq',
  evCharger: 'ev charger',
}

const NUMBER_WORDS: Record<string, number> = {
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
}

// Words that make a factual claim about the stay. Each may appear in copy only if the source mentions it.
const CLAIM_WORDS = [
  'hot tub',
  'pool',
  'sauna',
  'fireplace',
  'fire pit',
  'ocean',
  'lake',
  'mountain',
  'beach',
  'bbq',
  'grill',
  'ev charger',
  'kitchen',
  'wifi',
  'parking',
  'washer',
  'workspace',
  'desk',
  'air conditioning',
]

// Words that may start a sentence or line without being in the source. Anything else capitalised at the
// start of a sentence must come from the source, because an invented place name can hide there.
const COMMON_STARTERS = new Set(
  `a an the this that these those it its there here is are was be as at in on of for with from by to and or but if when where while after before
   then also each every both all some no one two three four five six seven eight nine ten eleven twelve
   soak slip warm unwind settle gather cook fire step cool swing rinse sleep head end enjoy relax watch walk
   open made built tall long short small big large high wide full free private shared quiet cozy snug warm bright
   floor ceiling wood stone cedar turf timber thatched shingled whitewashed traditional restored converted mid walled
   sand sunsets sunset evenings mornings breakfast air boot hot gas barrel plunge infinity saltwater queen double
   living dining kitchen terrace deck porch patio garden pool lodge cabin villa house cottage condo studio loft
   blue exposed dedicated underground concierge rooftop cave ocean lake mountain beach cliffs steps tatami
   covered outdoor direct ocean-facing walkable cafes parking pets sleeping sun balcony hammocks outside inside`.split(
    /\s+/,
  ),
)

export const LIMITS = {summaryMax: 90, highlightsMax: 4, sentencesMin: 3, sentencesMax: 5}

export function sourceText(s: SeedStay, hostName: string): string {
  return [
    s.title,
    s.type,
    s.city,
    s.region ?? '',
    s.country,
    s.neighborhood,
    hostName,
    `${s.guests} guests ${s.bedrooms} bedrooms ${s.beds} beds ${s.baths} bathrooms $${s.price} ${s.minNights} nights`,
    s.pets ? `pets allowed ${s.pets.max} pets $${s.pets.fee}` : 'pets not allowed',
    s.amenities.map((a) => AMENITY_LABEL[a] ?? a).join(' '),
    s.facts.join(' '),
    s.vibes.join(' '),
  ]
    .join(' \n ')
    .toLowerCase()
}

const has = (text: string, term: string) =>
  new RegExp(`\\b${term.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}`, 'i').test(text)

export function checkCopy(s: SeedStay, hostName: string): string[] {
  const problems: string[] = []
  const copy = [s.summary, s.description, ...s.highlights]
  const all = copy.join(' \n ')
  const src = sourceText(s, hostName)
  const srcNumbers = new Set((src.match(/\d+(\.\d+)?/g) ?? []).map(Number))

  // Length limits
  if (s.summary.length > LIMITS.summaryMax)
    problems.push(`summary is ${s.summary.length} chars (max ${LIMITS.summaryMax})`)
  if (s.highlights.length > LIMITS.highlightsMax)
    problems.push(`${s.highlights.length} highlights (max ${LIMITS.highlightsMax})`)
  const sentences = s.description.split(/(?<=[.!?])\s+/).filter(Boolean).length
  if (sentences < LIMITS.sentencesMin || sentences > LIMITS.sentencesMax)
    problems.push(
      `description has ${sentences} sentences (want ${LIMITS.sentencesMin}-${LIMITS.sentencesMax})`,
    )

  // Numbers (digits and number words) must exist in the source
  for (const n of all.match(/\d+(\.\d+)?/g) ?? [])
    if (!srcNumbers.has(Number(n))) problems.push(`number "${n}" is not in the source`)
  for (const [word, n] of Object.entries(NUMBER_WORDS))
    if (has(all, word) && !srcNumbers.has(n))
      problems.push(`number word "${word}" (${n}) is not in the source`)

  // Claim words (amenities, views, features) must exist in the source
  for (const term of CLAIM_WORDS)
    if (has(all, term) && !has(src, term))
      problems.push(`mentions "${term}" but the source does not`)

  // Pets
  if (!s.pets && /\b(pet|pets|dog|dogs|cat|cats)\b/i.test(all))
    problems.push('mentions pets but pets are not allowed')

  // Place names: capitalised words (not at the start of a sentence or line) must be the stay's own
  for (const line of copy) {
    const words = line.split(/\s+/)
    words.forEach((w, i) => {
      const clean = w.replace(/[^\p{L}-]/gu, '')
      const atStart = i === 0 || /[.!?]$/.test(words[i - 1])
      if (!/^[A-Z][a-zà-ÿ]+/.test(clean)) return
      const lower = clean.toLowerCase().split('-')[0]
      if (has(src, clean.toLowerCase()) || has(src, lower)) return
      if (atStart && COMMON_STARTERS.has(lower)) return
      problems.push(`"${clean}" is not in the source (name or place?)`)
    })
  }
  return problems
}
