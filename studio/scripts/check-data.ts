import { hosts } from '../seed/hosts'
import { policies } from '../seed/policies'
import { reviews } from '../seed/reviews'
import { stays } from '../seed/stays'
import { checkCopy } from './copy-check'

// Offline checks on the seed data: coverage of the filters, consistency, and copy against facts.
// Run: npx tsx scripts/check-data.ts
let failed = 0
const fail = (m: string) => {
  failed++
  console.log('  FAIL', m)
}
const ok = (m: string) => console.log('  ok  ', m)

const hostBySlug = new Map(hosts.map((h) => [h.slug, h]))
const policySlugs = new Set(policies.map((p) => p.slug))

console.log('counts')
;(stays.length === 30 ? ok : fail)(`${stays.length} stays`)
;(hosts.length === 12 ? ok : fail)(`${hosts.length} hosts`)
;(policies.length === 8 ? ok : fail)(`${policies.length} policies`)
;(reviews.length === 90 ? ok : fail)(`${reviews.length} reviews`)
;(new Set(stays.map((s) => s.slug)).size === stays.length ? ok : fail)('unique stay slugs')
;(new Set(reviews.map((r) => r.seedKey)).size === reviews.length ? ok : fail)(
  'unique review seedKeys',
)

console.log('filter coverage')
const by = (t: string) => stays.filter((s) => s.type === t)
const counts = {
  cabin: by('cabin').length,
  beach: by('beach').length,
  city: by('city').length,
  villa: by('villa').length,
}
;(counts.cabin === 8 && counts.beach === 8 && counts.city === 7 && counts.villa === 7 ? ok : fail)(
  `types ${JSON.stringify(counts)}`,
)
const prices = stays.map((s) => s.price)
;(Math.min(...prices) === 95 && Math.max(...prices) === 850 ? ok : fail)(
  `price range $${Math.min(...prices)}-$${Math.max(...prices)}`,
)
;(Math.min(...stays.map((s) => s.guests)) === 2 && Math.max(...stays.map((s) => s.guests)) === 12
  ? ok
  : fail)('guests 2-12')
const pets = stays.filter((s) => s.pets).length
;(pets >= 10 ? ok : fail)(`${pets} pet-friendly (>= 10)`)
const hot = stays.filter((s) => s.amenities.includes('hotTub')).length
;(hot >= 8 ? ok : fail)(`${hot} with a hot tub (>= 8)`)
console.log(
  '  info ',
  `pool ${stays.filter((s) => s.amenities.includes('pool')).length}, sauna ${stays.filter((s) => s.amenities.includes('sauna')).length}, fireplace ${stays.filter((s) => s.amenities.includes('fireplace')).length}`,
)
for (const t of ['cabin', 'beach', 'city', 'villa'] as const) {
  const p = by(t).map((s) => s.price)
  ;(new Set(p).size >= 5 ? ok : fail)(
    `${t}: ${new Set(p).size} different price points ($${Math.min(...p)}-$${Math.max(...p)})`,
  )
}

console.log('references')
for (const s of stays) {
  if (!hostBySlug.has(s.host)) fail(`${s.slug}: unknown host ${s.host}`)
  if (!policySlugs.has(`cancellation-${s.cancellation}`))
    fail(`${s.slug}: unknown cancellation ${s.cancellation}`)
}
const usedHosts = new Set(stays.map((s) => s.host))
;(usedHosts.size === hosts.length ? ok : fail)(
  `all ${hosts.length} hosts are used (${usedHosts.size})`,
)
ok('every stay has a host and a cancellation policy')

console.log('reviews')
for (const s of stays) {
  if (s.reviews.length !== 3) fail(`${s.slug}: ${s.reviews.length} reviews`)
  const avg = s.reviews.reduce((a, r) => a + r[1], 0) / s.reviews.length
  if (Math.abs(avg - s.rating) > 0.3)
    fail(`${s.slug}: review average ${avg.toFixed(2)} vs rating ${s.rating}`)
}
ok('3 reviews each, averages within 0.3 of the stay rating (unless listed above)')

console.log('copy vs facts')
let copyFails = 0
for (const s of stays) {
  const problems = checkCopy(s, hostBySlug.get(s.host)!.name)
  if (problems.length) {
    copyFails++
    fail(`${s.slug}`)
    problems.forEach((p) => console.log('        -', p))
  }
}
if (!copyFails) ok("all 30 stays' copy passes the code checks")

console.log('photos')
const noPhoto = stays.filter((s) => s.photoIds.length === 0).map((s) => s.slug)
console.log(
  `  note  ${stays.length - noPhoto.length} stays have a photo source; ${noPhoto.length} need one: ${noPhoto.join(', ')}`,
)

console.log(failed ? `\n${failed} problem(s)` : '\nall checks passed')
process.exit(failed ? 1 : 0)
