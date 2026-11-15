import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { hosts } from '../seed/hosts'
import { stays } from '../seed/stays'
import { resolvePhoto, runSeed, type Doc, type PhotoPicks, type Store } from './seed-core'

// Checks seed/photo-picks.json and proves the picks reach the stay and host documents.
// Run: npx tsx scripts/photo-picks.test.ts
const picks: PhotoPicks = JSON.parse(readFileSync(join(process.cwd(), 'seed', 'photo-picks.json'), 'utf8'))

// 1. The file is well formed: real slugs, 11-character Unsplash ids, no id used twice.
const all: string[] = []
for (const [slug, ids] of Object.entries(picks.stays ?? {})) {
  assert.ok(stays.some((s) => s.slug === slug), `unknown stay slug: ${slug}`)
  for (const id of ids) all.push(id)
}
for (const [slug, id] of Object.entries(picks.hosts ?? {})) {
  assert.ok(hosts.some((h) => h.slug === slug), `unknown host slug: ${slug}`)
  all.push(id)
}
for (const id of all) assert.match(id, /^[A-Za-z0-9_-]{11}$/, `not an 11-character Unsplash id: ${id}`)
assert.equal(new Set(all).size, all.length, 'a photo id is used twice')
assert.equal(resolvePhoto('gmQr2-qWkYQ').url, 'https://unsplash.com/photos/gmQr2-qWkYQ/download?force=true&w=2000')

// 2. Every stay that has no photo in the seed file has a pick, and every host has one.
for (const s of stays) if (s.photoIds.length === 0) assert.ok(picks.stays?.[s.slug]?.length, `no photo for ${s.slug}`)
for (const h of hosts) if (!h.photoId) assert.ok(picks.hosts?.[h.slug], `no portrait for ${h.slug}`)

// 3. The picks reach the documents.
async function flow() {
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
  const r = await runSeed(store, { dryRun: false, picks })
  const stay = (slug: string) => docs.find((d) => d._type === 'property' && d.slug.current === slug)!
  assert.equal(stay('kyoto-machiya-townhouse').photos.length, 2)
  assert.equal(stay('kyoto-machiya-townhouse').photos[0].asset._ref, 'asset-VCGQyqqsGGI')
  assert.equal(docs.find((d) => d._type === 'host' && d.slug.current === 'maya-chen')!.photo.asset._ref, 'asset-PmLxiS1uhbA')
  assert.equal(r.missingPhotos.length, 0, 'no stay is left without a photo')
  for (const s of stays) assert.ok(stay(s.slug).photos.length > 0, `${s.slug} has photos`)
  console.log(`ok  ${all.length} photo ids, all 30 stays and 12 hosts covered`)
}
flow()
