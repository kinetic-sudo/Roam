import assert from 'node:assert/strict'
import { hosts } from '../seed/hosts'
import { policies } from '../seed/policies'
import { reviews } from '../seed/reviews'
import { stays } from '../seed/stays'
import { resolvePhoto, runSeed, type Doc, type Store } from './seed-core'

// Proves the rerun behaviour against an in-memory store, with no Sanity involved.
// Run: npx tsx scripts/seed-core.test.ts

class MemoryStore implements Store {
  docs = new Map<string, Doc>()
  assets = new Map<string, string>()
  writes = 0
  uploads = 0
  urls: string[] = []
  failUploads = new Set<string>()
  private n = 0
  private keyOf = (d: Doc) => (d._type === 'review' ? d.seedKey : d.slug?.current)
  async find(type: string, key: string) {
    for (const d of this.docs.values())
      if (d._type === type && this.keyOf(d) === key) return structuredClone(d)
    return null
  }
  async create(doc: Omit<Doc, '_id'>) {
    const _id = `doc-${++this.n}`
    this.docs.set(_id, {...structuredClone(doc), _id} as Doc)
    this.writes++
    return {_id}
  }
  async patch(id: string, set: Record<string, unknown>) {
    Object.assign(this.docs.get(id)!, structuredClone(set))
    this.writes++
  }
  async listKeys(type: string) {
    return [...this.docs.values()].filter((d) => d._type === type).map((d) => this.keyOf(d))
  }
  async findAsset(id: string) {
    return this.assets.get(id) ?? null
  }
  async uploadAsset(id: string, url: string) {
    this.urls.push(url)
    if (this.failUploads.has(id)) return null
    const _id = `image-${id}`
    this.assets.set(id, _id)
    this.uploads++
    return _id
  }
  byKey = (type: string, key: string) =>
    [...this.docs.values()].find((d) => d._type === type && this.keyOf(d) === key)!
}

const total = policies.length + hosts.length + stays.length + reviews.length
const sum = (r: Awaited<ReturnType<typeof runSeed>>, f: 'created' | 'updated' | 'unchanged') =>
  Object.values(r.counts).reduce((a, c) => a + c[f], 0)
let passed = 0
const test = async (name: string, fn: () => Promise<void>) => {
  try {
    await fn()
    console.log('  ok  ', name)
    passed++
  } catch (e) {
    console.log('  FAIL', name, '\n      ', (e as Error).message)
    process.exitCode = 1
  }
}

;(async () => {
  const s = new MemoryStore()

  await test(`first run creates all ${total} documents`, async () => {
    const r = await runSeed(s, {dryRun: false})
    assert.equal(sum(r, 'created'), total)
    assert.equal(s.docs.size, total)
    assert.deepEqual(Object.fromEntries(Object.entries(r.counts).map(([k, c]) => [k, c.created])), {
      policy: 8,
      host: 12,
      property: 30,
      review: 90,
    })
  })

  await test('photos: 16 uploaded, 14 stays reported as missing a photo', async () => {
    assert.equal(s.uploads, 16)
    const r = await runSeed(s, {dryRun: true})
    assert.equal(r.missingPhotos.length, 14)
  })

  await test('second run creates nothing, updates nothing, writes nothing', async () => {
    const before = s.writes
    const r = await runSeed(s, {dryRun: false})
    assert.equal(sum(r, 'created'), 0)
    assert.equal(sum(r, 'updated'), 0)
    assert.equal(sum(r, 'unchanged'), total)
    assert.equal(s.writes, before)
    assert.equal(s.docs.size, total)
    assert.equal(s.uploads, 16, 'no photo was uploaded twice')
  })

  await test('a third run is still a no-op', async () => {
    const before = s.writes
    await runSeed(s, {dryRun: false})
    assert.equal(s.writes, before)
  })

  await test('references resolve: host, policy, photo asset, review -> stay', async () => {
    const ids = new Set(s.docs.keys())
    const assets = new Set(s.assets.values())
    for (const d of s.docs.values()) {
      if (d._type === 'property') {
        assert.ok(ids.has(d.host._ref), `${d.slug.current} host`)
        assert.ok(ids.has(d.cancellationPolicy._ref), `${d.slug.current} policy`)
        for (const p of d.photos) assert.ok(assets.has(p.asset._ref), `${d.slug.current} photo`)
      }
      if (d._type === 'review') assert.ok(ids.has(d.property._ref), `${d.seedKey} property`)
    }
    const kinds = new Set(
      stays.map((x) => s.byKey('policy', `cancellation-${x.cancellation}`).kind),
    )
    assert.deepEqual(
      [...kinds],
      ['cancellation'],
      'cancellationPolicy only points at cancellation policies',
    )
  })

  await test('typed filter fields are stored as numbers/enums, not text', async () => {
    const d = s.byKey('property', 'modern-cabin-with-hot-tub')
    assert.equal(d.type, 'cabin')
    assert.equal(typeof d.pricePerNight, 'number')
    assert.equal(typeof d.maxGuests, 'number')
    assert.deepEqual(d.amenities, ['hotTub', 'fireplace', 'firePit', 'wifi', 'kitchen', 'bbq'])
    assert.equal(d.houseRules.petsAllowed, true)
    assert.equal(d.houseRules.maxPets, 2)
    assert.equal(s.byKey('property', 'fjord-view-cabin').houseRules.petsAllowed, false)
    assert.equal(s.byKey('property', 'fjord-view-cabin').houseRules.maxPets, undefined)
  })

  await test('a changed seeded field is repaired, and only that field is patched', async () => {
    const d = s.byKey('property', 'dune-cottage')
    d.pricePerNight = 999
    const before = s.writes
    const r = await runSeed(s, {dryRun: false})
    assert.equal(r.counts.property.updated, 1)
    assert.equal(sum(r, 'updated'), 1)
    assert.equal(s.writes, before + 1)
    assert.equal(s.byKey('property', 'dune-cottage').pricePerNight, 275)
    assert.match(r.updatedKeys[0], /pricePerNight/)
  })

  await test("an editor's hotspot/crop does not count as drift", async () => {
    const d = s.byKey('property', 'dune-cottage')
    d.photos[0].hotspot = {x: 0.4, y: 0.5, width: 0.3, height: 0.3}
    d.photos[0].crop = {top: 0.1, bottom: 0.1, left: 0, right: 0}
    const before = s.writes
    const r = await runSeed(s, {dryRun: false})
    assert.equal(sum(r, 'updated'), 0)
    assert.equal(s.writes, before)
  })

  await test("fields the seed doesn't own are left alone (e.g. copyReview, a new field)", async () => {
    const d = s.byKey('property', 'dune-cottage')
    d.copyReview = {status: 'passed'}
    d.somethingElse = 'keep me'
    await runSeed(s, {dryRun: false})
    assert.deepEqual(s.byKey('property', 'dune-cottage').copyReview, {status: 'passed'})
    assert.equal(s.byKey('property', 'dune-cottage').somethingElse, 'keep me')
  })

  await test('documents not in the seed are reported and never deleted', async () => {
    await s.create({
      _type: 'host',
      name: 'Someone Added In Studio',
      slug: {_type: 'slug', current: 'someone-added-in-studio'},
    })
    await s.create({
      _type: 'property',
      title: 'Draft stay',
      slug: {_type: 'slug', current: 'draft-stay'},
    })
    const before = s.docs.size
    const r = await runSeed(s, {dryRun: false})
    assert.deepEqual(r.extras, {host: ['someone-added-in-studio'], property: ['draft-stay']})
    assert.equal(s.docs.size, before)
  })

  await test('dry run on an empty store writes nothing and reports the plan', async () => {
    const e = new MemoryStore()
    const r = await runSeed(e, {dryRun: true})
    assert.equal(e.writes, 0)
    assert.equal(e.docs.size, 0)
    assert.equal(e.uploads, 0)
    assert.equal(sum(r, 'created'), total)
    assert.equal(r.assets.uploaded, 16, 'reports 16 photos it would upload')
  })

  await test('dry run on a populated store changes nothing', async () => {
    const before = s.writes
    await runSeed(s, {dryRun: true})
    assert.equal(s.writes, before)
  })

  await test('a failed photo upload is reported, the stay is still seeded, and a later run fixes it', async () => {
    const e = new MemoryStore()
    e.failUploads.add('1520454974749-611b7248ffdb') // cliffside-beach-retreat's only photo
    const r1 = await runSeed(e, {dryRun: false})
    assert.deepEqual(r1.assets.failed, ['1520454974749-611b7248ffdb'])
    assert.ok(
      r1.missingPhotos.some(
        (m) => m.slug === 'cliffside-beach-retreat' && /upload failed/.test(m.reason),
      ),
    )
    assert.equal(e.byKey('property', 'cliffside-beach-retreat').photos.length, 0)
    e.failUploads.clear()
    const r2 = await runSeed(e, {dryRun: false})
    assert.equal(r2.counts.property.updated, 1)
    assert.equal(e.byKey('property', 'cliffside-beach-retreat').photos.length, 1)
    assert.equal(r2.counts.property.created, 0)
    const r3 = await runSeed(e, {dryRun: false})
    assert.equal(sum(r3, 'updated') + sum(r3, 'created'), 0)
  })

  await test('resolvePhoto understands every way of writing a photo', async () => {
    const page = {
      id: 'AbCdEfGhIjK',
      url: 'https://unsplash.com/photos/AbCdEfGhIjK/download?force=true&w=2000',
    }
    assert.deepEqual(
      resolvePhoto('https://unsplash.com/photos/a-room-with-a-view-AbCdEfGhIjK'),
      page,
    )
    assert.deepEqual(
      resolvePhoto('https://unsplash.com/photos/a-room-with-a-view-AbCdEfGhIjK?utm_source=x'),
      page,
    )
    assert.deepEqual(resolvePhoto('https://unsplash.com/photos/AbCdEfGhIjK'), page)
    assert.deepEqual(resolvePhoto('AbCdEfGhIjK'), page)
    const cdn = resolvePhoto('1510798831971-661eb04b3739')
    assert.equal(cdn.id, '1510798831971-661eb04b3739')
    assert.match(cdn.url, /^https:\/\/images\.unsplash\.com\/photo-1510798831971-661eb04b3739\?/)
    assert.equal(
      resolvePhoto('https://images.unsplash.com/photo-1510798831971-661eb04b3739?ixid=abc').id,
      '1510798831971-661eb04b3739',
    )
    assert.deepEqual(resolvePhoto('https://example.com/me.jpg'), {
      id: 'https://example.com/me.jpg',
      url: 'https://example.com/me.jpg',
    })
  })

  await test('a stay given an Unsplash page URL is downloaded once and a rerun is a no-op', async () => {
    const e = new MemoryStore()
    const stay = stays.find((x) => x.slug === 'kyoto-machiya-townhouse')!
    stay.photoIds = ['https://unsplash.com/photos/a-room-with-tatami-AbCdEfGhIjK']
    try {
      const r = await runSeed(e, {dryRun: false})
      assert.ok(
        e.urls.includes('https://unsplash.com/photos/AbCdEfGhIjK/download?force=true&w=2000'),
      )
      assert.equal(e.byKey('property', 'kyoto-machiya-townhouse').photos.length, 1)
      assert.match(
        e.byKey('property', 'kyoto-machiya-townhouse').photos[0].alt,
        /Kyoto Machiya Townhouse, Kyoto, Japan/,
      )
      assert.equal(r.missingPhotos.length, 13, 'one fewer stay is missing a photo')
      const before = e.writes
      const r2 = await runSeed(e, {dryRun: false})
      assert.equal(e.writes, before)
      assert.equal(sum(r2, 'updated') + sum(r2, 'created'), 0)
    } finally {
      stay.photoIds = []
    }
  })

  await test('adding a photo to an already-seeded stay updates only that stay', async () => {
    const e = new MemoryStore()
    await runSeed(e, {dryRun: false})
    const stay = stays.find((x) => x.slug === 'alfama-tile-front-apartment')!
    stay.photoIds = ['https://unsplash.com/photos/tiled-facade-QwErTyUiOpA']
    try {
      const r = await runSeed(e, {dryRun: false})
      assert.equal(r.counts.property.updated, 1)
      assert.equal(sum(r, 'updated'), 1)
      assert.equal(sum(r, 'created'), 0)
      assert.match(r.updatedKeys[0], /alfama-tile-front-apartment \(photos\)/)
    } finally {
      stay.photoIds = []
    }
  })

  await test("host portraits are optional, uploaded once, and a failed one doesn't block the host", async () => {
    const e = new MemoryStore()
    const [a, b] = hosts
    a.photoId = 'https://unsplash.com/photos/portrait-ZyXwVuTsRqP'
    b.photoId = 'https://unsplash.com/photos/portrait-LkJhGfDsAzX'
    e.failUploads.add('LkJhGfDsAzX')
    try {
      const r = await runSeed(e, {dryRun: false})
      assert.ok(e.byKey('host', a.slug).photo?.asset?._ref, 'first host has a portrait')
      assert.equal(
        e.byKey('host', b.slug).photo,
        undefined,
        'failed upload: host seeded without a portrait',
      )
      assert.ok(r.assets.failed.length === 1 && /LkJhGfDsAzX/.test(r.assets.failed[0]))
      assert.equal(
        e.byKey('host', hosts[2].slug).photo,
        undefined,
        'other hosts stay portrait-free',
      )
      e.failUploads.clear()
      const r2 = await runSeed(e, {dryRun: false})
      assert.equal(r2.counts.host.updated, 1, 'the retried host gets its portrait')
      const r3 = await runSeed(e, {dryRun: false})
      assert.equal(sum(r3, 'updated') + sum(r3, 'created'), 0)
    } finally {
      delete a.photoId
      delete b.photoId
    }
  })

  await test('slugs and keys are stable ids: no duplicated content after 5 runs', async () => {
    const e = new MemoryStore()
    for (let i = 0; i < 5; i++) await runSeed(e, {dryRun: false})
    assert.equal(e.docs.size, total)
    const keys = [...e.docs.values()].map((d) => `${d._type}:${d.slug?.current ?? d.seedKey}`)
    assert.equal(new Set(keys).size, keys.length)
  })

  console.log(`\n${passed} passed${process.exitCode ? ', with failures' : ''}`)
})()
