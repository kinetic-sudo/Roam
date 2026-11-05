// Runs the spec's verification queries against your LIVE Sanity dataset through the real parser and builder.
// Run from the app root: npx tsx scripts/verify-search.ts
// Expected counts below are for the 30 stays seeded by studio/scripts/seed.ts.
import { sanityQuery } from '../../src/lib/sanity'
import { knownPlaces, parseSearchQuery } from '../../src/lib/search/parse'
import { buildSearchQuery, PLACES_QUERY, type SortOption } from '../../src/lib/search/query'

type Row = {
  title: string
  type: string
  region?: string | null
  country: string
  pricePerNight: number
  maxGuests: number
  houseRules: {petsAllowed: boolean}
  amenities: string[]
}
let failed = 0
const ok = (name: string, cond: boolean, detail = '') => {
  if (!cond) failed++
  console.log(cond ? '  ok  ' : '  FAIL', name, detail)
}

;(async () => {
  const places = knownPlaces(await sanityQuery(PLACES_QUERY))
  console.log(`${places.length} place names loaded from the dataset\n`)
  const run = async (text: string, sort: SortOption = 'best') => {
    const parsed = parseSearchQuery(text, places)
    const {query, params} = buildSearchQuery(parsed, sort)
    const out = await sanityQuery<{total: number; stays: Row[]}>(query, params)
    return {parsed, ...out, titles: out.stays.map((s) => s.title)}
  }

  let r = await run('Cabins in California')
  ok(
    'Cabins in California → 3 California cabins',
    r.total === 3 && r.stays.every((s) => s.type === 'cabin' && s.region === 'CA'),
    r.titles.join(' | '),
  )
  r = await run('quiet pet friendly cabin with a hot tub under $300 a night')
  ok(
    'quiet pet friendly cabin with a hot tub under $300 → 2, the quiet one first',
    r.total === 2 &&
      r.titles[0] === 'Lakeside Log Cabin' &&
      r.stays.every(
        (s) => s.houseRules.petsAllowed && s.amenities.includes('hotTub') && s.pricePerNight <= 300,
      ),
    r.titles.join(' | '),
  )
  r = await run('beach house for 6')
  ok(
    'beach house for 6 → 3 beach stays sleeping 6+',
    r.total === 3 && r.stays.every((s) => s.type === 'beach' && s.maxGuests >= 6),
    r.titles.join(' | '),
  )
  r = await run('villa with pool in Greece')
  ok(
    'villa with pool in Greece → Clifftop Caldera Villa',
    r.titles.join() === 'Clifftop Caldera Villa',
    r.titles.join(' | '),
  )
  r = await run('romantic stay in Italy')
  ok(
    'romantic stay in Italy → 2 Italian villas',
    r.total === 2 && r.stays.every((s) => s.country === 'Italy'),
    r.titles.join(' | '),
  )
  r = await run('city loft under 150')
  ok(
    'city loft under 150 → 3 city stays ≤ $150',
    r.total === 3 && r.stays.every((s) => s.type === 'city' && s.pricePerNight <= 150),
    r.titles.join(' | '),
  )
  r = await run('igloo on the moon under $10')
  ok('igloo on the moon under $10 → empty', r.total === 0)
  r = await run('x"] | *[_type=="host"] //')
  ok(
    'injection text returns a normal result, never a GROQ error',
    r.total === 30,
    `total ${r.total}`,
  )
  r = await run('cabin', 'price-asc')
  const prices = r.stays.map((s) => s.pricePerNight)
  ok(
    'price low→high is ascending',
    prices.every((v, i) => i === 0 || prices[i - 1] <= v),
    prices.join(','),
  )

  // Soft words: does score()/boost()/match really rank on Content Lake?
  const quietSet = new Set(
    await sanityQuery<string[]>(
      `*[_type == "property" && type == "cabin" && "quiet" in vibes].title`,
    ),
  )
  r = await run('quiet cabin')
  ok(
    "'quiet cabin' ranks cabins whose vibes include quiet first",
    r.titles.slice(0, quietSet.size).every((t) => quietSet.has(t)),
    `${r.titles.slice(0, quietSet.size).join(' | ')}`,
  )

  console.log(failed ? `\n${failed} FAILED` : '\nall passed against the live dataset')
  process.exit(failed ? 1 : 0)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
