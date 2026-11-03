// Offline checks for the parser, chips and card tags (no network, no Sanity).
// Run from the app root: npx tsx scripts/check-search.ts
import assert from 'node:assert/strict'
import { knownPlaces, parseSearchQuery } from '../../src/lib/search/parse'
import {
    buildSearchQuery,
    chipsFor,
    isChipOn,
    matchTags,
    toggleChip,
} from '../../src/lib/search/query'

const places = knownPlaces([
  {city: 'Lisbon', country: 'Portugal'},
  {city: 'Tahoe City', region: 'CA', country: 'United States'},
  {city: 'Kihei', region: 'HI', country: 'United States'},
  {city: 'Ubud', region: 'Bali', country: 'Indonesia'},
  {city: 'Mexico City', country: 'Mexico'},
  {city: 'Tulum', country: 'Mexico'},
  {city: 'Oia', region: 'Santorini', country: 'Greece'},
  {city: 'Bellagio', country: 'Italy'},
])
let n = 0
const t = (name: string, fn: () => void) => {
  try {
    fn()
    console.log('  ok  ', name)
    n++
  } catch (e) {
    console.log('  FAIL', name, '\n      ', (e as Error).message)
    process.exitCode = 1
  }
}
const p = (q: string) => parseSearchQuery(q, places)

console.log('parser')
t('the spec sentence', () => {
  const r = p('quiet pet friendly cabin with a hot tub under $300 a night')
  assert.deepEqual(
    [r.type, r.maxPrice, r.pets, r.amenities, r.vibes, r.place],
    ['cabin', 300, true, ['hotTub'], ['quiet'], undefined],
  )
})
t('beach house for 6', () => {
  const r = p('beach house for 6')
  assert.deepEqual([r.type, r.guests, r.amenities], ['beach', 6, []])
})
t("'beach' and 'peaceful' never become A/C", () => {
  assert.deepEqual(p('peaceful beach villa').amenities, [])
})
t("'beach access' is an amenity, not the type", () => {
  const r = p('villa with beach access')
  assert.deepEqual([r.type, r.amenities], ['villa', ['beachAccess']])
})
t('earliest type word wins', () => {
  assert.equal(p('a villa near the beach').type, 'villa')
})
t("'for 2 nights' is not a guest count", () => {
  assert.equal(p('cabin for 2 nights').guests, undefined)
})
t("'under 5 guests' is not a price", () => {
  assert.equal(p('cabin under 5 guests').maxPrice, undefined)
})
t('price forms', () => {
  assert.equal(p('city loft under 150').maxPrice, 150)
  assert.equal(p('cabin < 300').maxPrice, 300)
  assert.equal(p('cabin $250 a night').maxPrice, 250)
})
t('pets forms', () => {
  for (const s of [
    'pet-friendly cabin',
    'dog friendly cabin',
    'cabin pets allowed',
    'cabin with my dog',
  ])
    assert.equal(p(s).pets, true, s)
})
t('synonyms', () => {
  assert.deepEqual(p('jacuzzi and wi-fi and a/c').amenities, ['hotTub', 'wifi', 'ac'])
})
t('place: state name → code both ways', () => {
  const a = p('cabins in California')
  assert.deepEqual([a.place, a.placeAlt], ['california', 'ca'])
  const b = p('stays in CA')
  assert.deepEqual([b.place, b.placeAlt], ['ca', 'california'])
})
t('place: real place names, longest first', () => {
  assert.equal(p('apartment in mexico city').place, 'mexico city')
  assert.equal(p('stay in mexico').place, 'mexico')
  assert.equal(p('tahoe city cabin').place, 'tahoe city')
  assert.equal(p('tahoe city cabin').type, 'cabin')
})
t('place: country aliases', () => {
  assert.equal(p('somewhere in the usa').place, 'united states')
})
t("'cabin in the woods' is a soft phrase, not a place", () => {
  const r = p('cabin in the woods')
  assert.deepEqual([r.place, r.type], [undefined, 'cabin'])
})
t('two-letter codes only count after in/near', () => {
  assert.equal(p('hi there cabin').place, undefined)
  assert.equal(p('cabin or villa').place, undefined)
})
t('an unknown place is never invented', () => {
  assert.equal(p('villa in narnia').place, undefined)
})
t('empty text parses to an empty query', () => {
  const r = p('')
  assert.deepEqual(
    [r.type, r.maxPrice, r.guests, r.pets, r.place, r.amenities, r.vibes],
    [undefined, undefined, undefined, undefined, undefined, [], []],
  )
})

console.log('query builder')
t('values are params, never interpolated', () => {
  const {query, params} = buildSearchQuery(p('x"] | *[_type=="host"] //'), 'best')
  assert.ok(!query.includes('host') && !query.includes('//'))
  assert.equal(params.vibe0, undefined)
})
t('filters and params line up', () => {
  const {query, params} = buildSearchQuery(
    p('quiet pet friendly cabin with a hot tub under $300 a night'),
    'best',
  )
  for (const k of Object.keys(params)) assert.ok(query.includes(`$${k}`), `$${k} is used`)
  assert.ok(
    query.includes('_type == "property"') && query.includes('score(') && query.includes('[0...50]'),
  )
})
t('each sort has its own order()', () => {
  assert.match(buildSearchQuery(p('cabin'), 'price-asc').query, /order\(pricePerNight asc/)
  assert.match(buildSearchQuery(p('cabin'), 'price-desc').query, /order\(pricePerNight desc/)
  assert.match(buildSearchQuery(p('quiet cabin'), 'price-asc').query, /order\(pricePerNight asc/) // vibes never override a chosen sort
  assert.ok(!buildSearchQuery(p('quiet cabin'), 'price-asc').query.includes('score('))
})

console.log('chips')
t('order and labels', () => {
  const c = chipsFor(p('quiet pet friendly cabin with a hot tub under $300 a night'))
  assert.deepEqual(
    c.slice(0, 5).map((x) => x.label),
    ['Cabins', 'Under $300', 'Pet Friendly', 'Hot Tub', 'Quiet'],
  )
  assert.ok(c.length - 5 <= 4 && c.slice(5).every((x) => x.suggested))
  assert.deepEqual(
    ['cabin', 'beach', 'city', 'villa'].map((s) => chipsFor(p(s))[0].label),
    ['Cabins', 'Beach', 'City', 'Villas'],
  )
})
t('toggling off keeps the chip, and toggling on restores it', () => {
  const base = p('cabins in california')
  const chip = chipsFor(base)[0]
  const off = toggleChip(base, chip)
  assert.equal(off.type, undefined)
  assert.ok(chipsFor(base).some((x) => x.id === 'type'))
  assert.equal(isChipOn(off, chip), false)
  assert.equal(toggleChip(off, chip).type, 'cabin')
  assert.equal(base.type, 'cabin', 'input not mutated')
})
t('a suggestion switches on', () => {
  const base = p('cabin')
  const sug = chipsFor(base).find((x) => x.label === 'Under $300')!
  assert.equal(toggleChip(base, sug).maxPrice, 300)
})

console.log('card tags')
const tags = (am: string[], pets: boolean, q: string) =>
  matchTags({amenities: am as any, houseRules: {petsAllowed: pets}}, p(q))
    .map((x) => x.label)
    .join(' + ')
t('Hot Tub + Pet Friendly', () =>
  assert.equal(tags(['hotTub', 'fireplace', 'wifi'], true, 'cabin'), 'Hot Tub + Pet Friendly'),
)
t('Pool + Ocean View (no pets)', () =>
  assert.equal(tags(['pool', 'oceanView', 'wifi'], false, 'villa'), 'Pool + Ocean View'),
)
t('Fireplace + Pet Friendly', () =>
  assert.equal(tags(['fireplace', 'wifi'], true, 'cabin'), 'Fireplace + Pet Friendly'),
)
t('a searched amenity comes first', () =>
  assert.equal(tags(['hotTub', 'sauna'], false, 'sauna').split(' + ')[0], 'Sauna'),
)
t('nothing standout → everyday amenities', () =>
  assert.equal(tags(['wifi', 'kitchen', 'workspace'], false, 'studio'), 'Workspace + Wifi'),
)

console.log(`\n${n} passed`)
