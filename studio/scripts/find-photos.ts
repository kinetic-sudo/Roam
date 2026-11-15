import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { hosts } from '../seed/hosts'
import { stays } from '../seed/stays'

// Finds free Unsplash photos for the stays and hosts that have none, and saves them to seed/photo-picks.json.
// The seed reads that file, uploads the photos to Sanity and links them. Photos you already picked are kept.
//
//   1. Get a free key: https://unsplash.com/developers  ->  New Application  ->  copy the "Access Key"
//   2. UNSPLASH_ACCESS_KEY=your-key npm run photos          (add --force to choose again)
//   3. npm run seed:dry     (look at the "photos" lines, then)      npm run seed
//
// The API only returns free photos (no Unsplash+). Unsplash allows 50 requests an hour for a new key: this
// script needs about 17, and saves its progress after every request, so if you hit the limit just run it again later.

const KEY = process.env.UNSPLASH_ACCESS_KEY
const FILE = join(process.cwd(), 'seed', 'photo-picks.json')
const CREDITS = join(process.cwd(), 'seed', 'photo-credits.json')
const FORCE = process.argv.includes('--force')
const PER_STAY = 2

/** What to search for, written the way Unsplash captions its photos. */
export const STAY_QUERY: Record<string, string> = {
  'a-frame-in-the-catskills': 'a-frame cabin in the forest',
  'tahoe-lodge-with-sauna-and-hot-tub': 'wooden lodge by a lake',
  'tiny-cabin-in-the-smokies': 'small cabin in the woods',
  'kihei-beachfront-condo': 'beachfront apartment balcony ocean view hawaii',
  'tamarindo-casita-with-pool': 'tropical house with pool and palm trees',
  'byron-bay-garden-bungalow': 'beach bungalow with garden',
  'harbour-view-cottage': 'st ives cornwall harbour cottages',
  'alfama-tile-front-apartment': 'lisbon building with blue tiles',
  'condesa-studio-under-the-trees': 'mexico city apartment building with trees',
  'kyoto-machiya-townhouse': 'kyoto traditional wooden townhouse',
  'eastside-loft-with-private-hot-tub': 'modern loft apartment with hot tub',
  'seminyak-garden-villa': 'bali villa with private pool',
  'deia-hillside-villa': 'mallorca stone villa with sea view',
  'lake-como-garden-villa': 'lake como villa with garden',
}

/** Which kind of portrait suits each host. Hosts of the same kind take different photos from one result list. */
export const HOST_KIND: Record<string, 'woman' | 'man' | 'couple'> = {
  'maya-chen': 'woman',
  'daniel-okafor': 'man',
  'sofia-rinaldi': 'woman',
  'liam-hargrove': 'man',
  'priya-nair': 'woman',
  'mateo-alvarez': 'man',
  'hannah-lindqvist': 'woman',
  'kenji-watanabe': 'man',
  'amara-osei': 'woman',
  'tom-and-ellie-brooks': 'couple',
  'isabela-santos': 'woman',
  'jonas-berg': 'man',
}
const PORTRAIT_QUERY = {
  woman: 'portrait of a smiling woman',
  man: 'portrait of a smiling man',
  couple: 'portrait of a smiling couple',
} as const

type ApiPhoto = {
  id: string
  width: number
  height: number
  user: { name: string; links: { html: string } }
  links: { html: string }
}
type Picks = { stays: Record<string, string[]>; hosts: Record<string, string> }
type Credits = Record<string, { by: string; page: string }>

/** The first `n` photos that are wide enough and not used yet. Pure: easy to test. */
export function choose(results: ApiPhoto[], used: Set<string>, n: number, minWidth: number): ApiPhoto[] {
  const out: ApiPhoto[] = []
  for (const p of results) {
    if (out.length === n) break
    if (used.has(p.id) || p.width < minWidth) continue
    used.add(p.id)
    out.push(p)
  }
  return out
}

class Stop extends Error {}

async function search(query: string, orientation: 'landscape' | 'squarish', perPage: number): Promise<ApiPhoto[]> {
  const url = new URL('https://api.unsplash.com/search/photos')
  url.searchParams.set('query', query)
  url.searchParams.set('orientation', orientation)
  url.searchParams.set('per_page', String(perPage))
  url.searchParams.set('content_filter', 'high')
  const res = await fetch(url, { headers: { Authorization: `Client-ID ${KEY}`, 'Accept-Version': 'v1' } })
  if (res.status === 401) throw new Stop('Unsplash rejected the key. Check UNSPLASH_ACCESS_KEY.')
  if (res.status === 403) throw new Stop('Unsplash rate limit reached (50 requests an hour). Your progress is saved: run it again later.')
  if (!res.ok) throw new Error(`Unsplash answered ${res.status} for "${query}"`)
  return ((await res.json()) as { results: ApiPhoto[] }).results
}

const readJson = <T,>(file: string, fallback: T): T => {
  if (!existsSync(file)) return fallback
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as T
  } catch {
    return fallback
  }
}
const save = (picks: Picks, credits: Credits) => {
  writeFileSync(FILE, JSON.stringify(picks, null, 2) + '\n')
  writeFileSync(CREDITS, JSON.stringify(credits, null, 2) + '\n')
}

async function main() {
  if (!KEY) {
    console.error('Set UNSPLASH_ACCESS_KEY first (free: https://unsplash.com/developers).\n  UNSPLASH_ACCESS_KEY=... npm run photos')
    process.exit(1)
  }
  const saved = readJson<Partial<Picks>>(FILE, {})
  const picks: Picks = FORCE ? { stays: {}, hosts: {} } : { stays: saved.stays ?? {}, hosts: saved.hosts ?? {} }
  const credits = readJson<Credits>(CREDITS, {})
  const used = new Set<string>([...Object.values(picks.stays).flat(), ...Object.values(picks.hosts)])
  const note = (p: ApiPhoto) => (credits[p.id] = { by: p.user.name, page: p.links.html })

  try {
    for (const s of stays) {
      if (s.photoIds.length > 0 || picks.stays[s.slug]?.length) continue
      const query = STAY_QUERY[s.slug] ?? `${s.title} ${s.city}`
      const found = choose(await search(query, 'landscape', 12), used, PER_STAY, 1800)
      if (found.length === 0) {
        console.log(`  no photo for ${s.slug} ("${query}")`)
        continue
      }
      picks.stays[s.slug] = found.map((p) => p.id)
      found.forEach(note)
      save(picks, credits)
      console.log(`  ${s.slug}: ${found.map((p) => p.links.html).join('  ')}`)
    }

    const pending = hosts.filter((h) => !h.photoId && !picks.hosts[h.slug])
    for (const kind of ['woman', 'man', 'couple'] as const) {
      const group = pending.filter((h) => (HOST_KIND[h.slug] ?? 'woman') === kind)
      if (group.length === 0) continue
      const results = await search(PORTRAIT_QUERY[kind], 'squarish', 30)
      const found = choose(results, used, group.length, 800)
      group.forEach((h, i) => {
        const p = found[i]
        if (!p) return console.log(`  no portrait left for ${h.slug}`)
        picks.hosts[h.slug] = p.id
        note(p)
        console.log(`  ${h.slug}: ${p.links.html}`)
      })
      save(picks, credits)
    }
  } catch (e) {
    save(picks, credits)
    if (e instanceof Stop) {
      console.error(`\n${e.message}`)
      process.exit(2)
    }
    throw e
  }

  const missing = stays.filter((s) => s.photoIds.length === 0 && !picks.stays[s.slug]?.length).length
  console.log(`\nSaved to seed/photo-picks.json. Stays still without a photo: ${missing}.\nNext: npm run seed:dry, then npm run seed`)
}

// Runs only when called directly, so the pure helpers above can be imported by tests.
if (process.argv[1]?.endsWith('find-photos.ts')) {
  main().catch((e) => {
    console.error(e)
    process.exit(1)
  })
}
