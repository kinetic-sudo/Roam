import type { SanityClient } from '@sanity/client'
import { getCliClient } from 'sanity/cli'

import { formatReport, runSeed, type Doc, type Store } from './seed-core.test'

// Seeds Roam's content: 8 policies, 12 hosts, 30 stays, 90 reviews. Safe to run more than once.
//
//   npx sanity exec scripts/seed.ts --with-user-token -- --dry-run     (reads only, prints the plan)
//   npx sanity exec scripts/seed.ts --with-user-token                  (writes)
//
// Project and dataset come from sanity.cli.ts, so the same script works against any dataset you point it at.

const keyField = (type: string) => (type === 'review' ? 'seedKey' : 'slug.current')

function sanityStore(client: SanityClient): Store {
  return {
    find: (type, key) =>
      client.fetch<Doc | null>(`*[_type == $t && ${keyField(type)} == $k][0]`, {t: type, k: key}),
    async create(doc) {
      const created = await client.create(doc as any)
      return {_id: created._id}
    },
    async patch(id, set) {
      await client.patch(id).set(set).commit()
    },
    listKeys: (type) => client.fetch<string[]>(`*[_type == $t].${keyField(type)}`, {t: type}),
    findAsset: (id) =>
      client.fetch<string | null>(
        `*[_type == "sanity.imageAsset" && source.name == "unsplash" && source.id == $id][0]._id`,
        {id},
      ),
    async uploadAsset(id, url, filename) {
      try {
        const res = await fetch(url)
        if (!res.ok) return null
        const asset = await client.assets.upload('image', Buffer.from(await res.arrayBuffer()), {
          filename,
          source: {id, name: 'unsplash', url},
        })
        return asset._id
      } catch {
        return null
      }
    },
  }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const client = getCliClient({apiVersion: '2026-10-08'}).withConfig({useCdn: false})
  const {projectId, dataset} = client.config()
  console.log(`${dryRun ? 'Dry run against' : 'Seeding'} ${projectId} / ${dataset}\n`)

  const report = await runSeed(sanityStore(client), {dryRun})
  console.log(formatReport(report))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
