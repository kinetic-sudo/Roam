import { hosts } from '../seed/hosts'
import { policies } from '../seed/policies'
import { reviews } from '../seed/reviews'
import { stays } from '../seed/stays'

// The seed logic, independent of Sanity: it talks to a `Store`. scripts/seed.ts plugs in the real client;
// scripts/seed-core.test.ts plugs in an in-memory one to prove the rerun behaviour.
//
// Rules: every seeded document is looked up by its content key (slug, or seedKey for reviews), never by
// a hand-built _id. Missing -> create. Present -> patch ONLY the seeded fields that differ. Nothing is deleted.

export type Doc = {_id: string; _type: string; [field: string]: any}

export interface Store {
  find(type: string, key: string): Promise<Doc | null>
  create(doc: Omit<Doc, '_id'>): Promise<{_id: string}>
  patch(id: string, set: Record<string, unknown>): Promise<void>
  listKeys(type: string): Promise<string[]>
  findAsset(sourceId: string): Promise<string | null>
  /** Returns the new asset _id, or null when the photo could not be fetched or uploaded. */
  uploadAsset(sourceId: string, url: string, filename: string): Promise<string | null>
}

export type Counts = {created: number; updated: number; unchanged: number}
export type Report = {
  dryRun: boolean
  counts: Record<'policy' | 'host' | 'property' | 'review', Counts>
  assets: {reused: number; uploaded: number; failed: string[]}
  missingPhotos: {slug: string; reason: string}[]
  /** Documents that exist in the dataset but not in the seed. Never touched. */
  extras: Record<string, string[]>
  updatedKeys: string[]
}

export const photoUrl = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=2000&q=80`

// ---------- comparison ----------
function norm(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(norm)
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>
    return Object.fromEntries(
      Object.keys(o)
        .filter((k) => o[k] !== undefined && k !== 'hotspot' && k !== 'crop') // editors' crops don't count as drift
        .sort()
        .map((k) => [k, norm(o[k])]),
    )
  }
  return v
}
const same = (a: unknown, b: unknown) => JSON.stringify(norm(a)) === JSON.stringify(norm(b))
const ref = (id: string) => ({_type: 'reference' as const, _ref: id})
const clean = <T extends Record<string, unknown>>(o: T): T =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T
const placeOf = (s: {city: string; region?: string; country: string}) =>
  `${s.city}, ${s.region ?? s.country}`

export async function runSeed(store: Store, opts: {dryRun: boolean}): Promise<Report> {
  const {dryRun} = opts
  const report: Report = {
    dryRun,
    counts: {policy: blank(), host: blank(), property: blank(), review: blank()},
    assets: {reused: 0, uploaded: 0, failed: []},
    missingPhotos: [],
    extras: {},
    updatedKeys: [],
  }

  async function upsert(
    type: keyof Report['counts'],
    key: string,
    desired: Record<string, unknown>,
  ): Promise<string> {
    const c = report.counts[type]
    const existing = await store.find(type, key)
    if (!existing) {
      c.created++
      if (dryRun) return `dry:${type}:${key}`
      return (await store.create({_type: type, ...desired}))._id
    }
    const changed = Object.keys(desired).filter((f) => !same(existing[f], desired[f]))
    if (changed.length === 0) {
      c.unchanged++
    } else {
      c.updated++
      report.updatedKeys.push(`${type}:${key} (${changed.join(', ')})`)
      if (!dryRun)
        await store.patch(existing._id, Object.fromEntries(changed.map((f) => [f, desired[f]])))
    }
    return existing._id
  }

  // 1. policies, 2. hosts (referenced by stays)
  const policyId = new Map<string, string>()
  for (const p of policies) {
    policyId.set(
      p.slug,
      await upsert('policy', p.slug, {
        title: p.title,
        slug: {_type: 'slug', current: p.slug},
        kind: p.kind,
        summary: p.summary,
        body: p.body,
      }),
    )
  }
  const hostId = new Map<string, string>()
  for (const h of hosts) {
    hostId.set(
      h.slug,
      await upsert('host', h.slug, {
        name: h.name,
        slug: {_type: 'slug', current: h.slug},
        bio: h.bio,
        isSuperhost: h.isSuperhost,
        hostingSince: h.hostingSince,
        responseTime: h.responseTime,
        languages: h.languages,
      }),
    )
  }

  // 3. photos, then stays
  const assetCache = new Map<string, string | null>()
  async function resolveAsset(photoId: string): Promise<string | null> {
    if (assetCache.has(photoId)) return assetCache.get(photoId)!
    let id = await store.findAsset(photoId)
    if (id) report.assets.reused++
    else if (dryRun) {
      id = `dry-asset:${photoId}`
      report.assets.uploaded++ // "would upload"
    } else {
      id = await store.uploadAsset(photoId, photoUrl(photoId), `${photoId}.jpg`)
      if (id) report.assets.uploaded++
      else report.assets.failed.push(photoId)
    }
    assetCache.set(photoId, id)
    return id
  }

  const propertyId = new Map<string, string>()
  for (const s of stays) {
    const photos: unknown[] = []
    if (s.photoIds.length === 0)
      report.missingPhotos.push({slug: s.slug, reason: 'no photo source yet (photoIds is empty)'})
    for (const [i, pid] of s.photoIds.entries()) {
      const asset = await resolveAsset(pid)
      if (!asset) {
        report.missingPhotos.push({slug: s.slug, reason: `upload failed for ${pid}`})
        continue
      }
      photos.push({
        _type: 'image',
        _key: `photo-${i}`,
        asset: ref(asset),
        alt: `${s.title}, ${placeOf(s)}`,
      })
    }

    const rules = clean({
      checkInTime: s.checkIn ?? '15:00',
      checkOutTime: s.checkOut ?? '11:00',
      quietHoursFrom: s.quiet?.[0],
      quietHoursTo: s.quiet?.[1],
      petsAllowed: !!s.pets,
      maxPets: s.pets?.max,
      petFee: s.pets?.fee,
      smokingAllowed: false,
      partiesAllowed: false,
      additionalRules: s.rules,
    })

    propertyId.set(
      s.slug,
      await upsert(
        'property',
        s.slug,
        clean({
          title: s.title,
          slug: {_type: 'slug', current: s.slug},
          type: s.type,
          host: ref(hostId.get(s.host)!),
          cancellationPolicy: ref(policyId.get(`cancellation-${s.cancellation}`)!),
          rating: s.rating,
          reviewCount: s.reviewCount,
          city: s.city,
          region: s.region,
          country: s.country,
          neighborhood: s.neighborhood,
          location: {_type: 'geopoint', lat: s.lat, lng: s.lng},
          maxGuests: s.guests,
          bedrooms: s.bedrooms,
          beds: s.beds,
          bathrooms: s.baths,
          amenities: s.amenities,
          pricePerNight: s.price,
          cleaningFee: s.cleaning,
          minNights: s.minNights,
          weeklyDiscountPercent: s.weekly,
          houseRules: rules,
          vibes: s.vibes,
          facts: s.facts,
          summary: s.summary,
          description: s.description,
          highlights: s.highlights,
          photos,
        }),
      ),
    )
  }

  // 4. reviews
  for (const r of reviews) {
    await upsert('review', r.seedKey, {
      property: ref(propertyId.get(r.staySlug)!),
      guestName: r.guestName,
      rating: r.rating,
      stayedAt: r.stayedAt,
      text: r.text,
      seedKey: r.seedKey,
    })
  }

  // 5. anything in the dataset that is not in the seed (reported, never deleted)
  const seeded: Record<string, Set<string>> = {
    policy: new Set(policies.map((p) => p.slug)),
    host: new Set(hosts.map((h) => h.slug)),
    property: new Set(stays.map((s) => s.slug)),
    review: new Set(reviews.map((r) => r.seedKey)),
  }
  for (const type of Object.keys(seeded)) {
    const extra = (await store.listKeys(type)).filter((k) => k && !seeded[type].has(k))
    if (extra.length) report.extras[type] = extra
  }
  return report
}

function blank(): Counts {
  return {created: 0, updated: 0, unchanged: 0}
}

export function formatReport(r: Report): string {
  const verb = r.dryRun ? 'would be ' : ''
  const lines = [r.dryRun ? 'DRY RUN: nothing was written.\n' : 'Seed finished.\n']
  for (const [type, c] of Object.entries(r.counts)) {
    lines.push(
      `  ${type.padEnd(9)} ${verb}created ${String(c.created).padStart(3)}   ${verb}updated ${String(c.updated).padStart(3)}   unchanged ${String(c.unchanged).padStart(3)}`,
    )
  }
  lines.push(
    `\n  photos    reused ${r.assets.reused}, ${r.dryRun ? 'would upload' : 'uploaded'} ${r.assets.uploaded}, failed ${r.assets.failed.length}`,
  )
  if (r.updatedKeys.length)
    lines.push(`\n  Updated (seeded fields only):\n    ${r.updatedKeys.join('\n    ')}`)
  if (r.missingPhotos.length)
    lines.push(
      `\n  ${r.missingPhotos.length} stays have no photo yet:\n    ${r.missingPhotos.map((m) => `${m.slug}: ${m.reason}`).join('\n    ')}`,
    )
  const extras = Object.entries(r.extras)
  if (extras.length)
    lines.push(
      `\n  In the dataset but not in the seed (left alone):\n    ${extras.map(([t, k]) => `${t}: ${k.join(', ')}`).join('\n    ')}`,
    )
  return lines.join('\n')
}
