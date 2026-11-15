import assert from 'node:assert/strict'
import { hosts } from '../seed/hosts'
import { stays } from '../seed/stays'
import { HOST_KIND, STAY_QUERY, choose } from './find-photos'
import { runSeed, type Doc, type Store } from './seed-core'

// Run: npx tsx scripts/find-photos.test.ts
const photo = (id: string, width = 4000) =>
  ({ id, width, height: 3000, user: { name: 'x', links: { html: '' } }, links: { html: '' } }) as any

const used = new Set<string>(['b'])
const got = choose([photo('a'), photo('b'), photo('c', 900), photo('d'), photo('e')], used, 2, 1800)
assert.deepEqual(got.map((p) => p.id), ['a', 'd'], 'skips used ids and photos that are too narrow')
assert.ok(used.has('a') && used.has('d'), 'chosen ids are marked used')
assert.deepEqual(choose([], new Set(), 2, 1), [])

for (const s of stays) if (s.photoIds.length === 0) assert.ok(STAY_QUERY[s.slug], `search for ${s.slug}`)
for (const h of hosts) assert.ok(HOST_KIND[h.slug], `portrait kind for ${h.slug}`)
console.log('find-photos checks pass')

// The picks reach the documents: a picked stay and host get a photo, an unpicked stay does not, and a stay
// that already has photoIds in the seed file keeps its own.
async function picksFlow() {
  const docs: Doc[] = []
  const assets = new Map<string, string>()
  const store: Store = {
    find: async (t, k) => docs.find((d) => d._type === t && (d.slug?.current ?? d.seedKey) === k) ?? null,
    create: async (d) => (docs.push({ ...d, _id: `id${docs.length}` }), { _id: `id${docs.length - 1}` }),
    patch: async () => {},
    listKeys: async () => [],
    findAsset: async (id) => assets.get(id) ?? null,
    uploadAsset: async (id) => (assets.set(id, `asset-${id}`), `asset-${id}`),
  }
  const kyoto = 'kyoto-machiya-townhouse'
  const own = stays.find((s) => s.photoIds.length > 0)!
  const r = await runSeed(store, {
    dryRun: false,
    picks: { stays: { [kyoto]: ['VCGQyqqsGGI', 'Dmko4LCIuFs'], [own.slug]: ['ZZZZZZZZZZZ'] }, hosts: { 'maya-chen': 'abcdefghijk' } },
  })
  const stay = (slug: string) => docs.find((d) => d._type === 'property' && d.slug.current === slug)!
  assert.equal(stay(kyoto).photos.length, 2, 'picked stay gets its photos')
  assert.equal(stay(kyoto).photos[0].asset._ref, 'asset-VCGQyqqsGGI')
  assert.equal(stay(own.slug).photos[0].asset._ref.includes('ZZZZZZZZZZZ'), false, "the seed file's own photo wins over a pick")
  assert.equal(docs.find((d) => d._type === 'host' && d.slug.current === 'maya-chen')!.photo.asset._ref, 'asset-abcdefghijk')
  assert.equal(docs.find((d) => d._type === 'host' && d.slug.current === 'daniel-okafor')!.photo, undefined, 'unpicked host stays photo-less')
  assert.equal(r.missingPhotos.length, 13, 'only the unpicked stays are still reported as missing')
  console.log('picks flow into stays and hosts')
}
picksFlow().then(() => console.log('all photo checks pass'))
