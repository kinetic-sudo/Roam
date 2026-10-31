import { schemaTypes } from '../schemaTypes'
import { runSeed, type Doc, type Store } from './seed-core'

// Every field the seed writes must exist in the schema, and every enum-like value must be one the schema allows.
class Capture implements Store {
  docs: Doc[] = []
  n = 0
  async find() {
    return null
  }
  async create(doc: Omit<Doc, '_id'>) {
    const d = {...doc, _id: `d${++this.n}`} as Doc
    this.docs.push(d)
    return {_id: d._id}
  }
  async patch() {}
  async listKeys() {
    return []
  }
  async findAsset() {
    return null
  }
  async uploadAsset(id: string) {
    return `image-${id}`
  }
}

;(async () => {
  const cap = new Capture()
  await runSeed(cap, {dryRun: false})
  const typeByName = new Map((schemaTypes as any[]).map((t) => [t.name, t]))
  let problems = 0
  const bad = (m: string) => {
    problems++
    console.log('  FAIL', m)
  }

  const allowed = (field: any): string[] | null => {
    const list = field.options?.list ?? field.of?.[0]?.options?.list ?? field.of?.[0]?.options?.list
    const arr =
      field.options?.list ?? (field.of?.length === 1 ? field.of[0].options?.list : undefined)
    return arr ? arr.map((x: any) => (typeof x === 'string' ? x : x.value)) : null
  }

  for (const d of cap.docs) {
    const t: any = typeByName.get(d._type)
    if (!t) {
      bad(`no schema type "${d._type}"`)
      continue
    }
    const fields = new Map<string, any>(t.fields.map((f: any) => [f.name, f]))
    for (const [k, v] of Object.entries(d)) {
      if (k.startsWith('_')) continue
      const f = fields.get(k)
      if (!f) {
        bad(`${d._type}.${k} is not a field in the schema`)
        continue
      }
      const list = f.options?.list
        ? f.options.list.map((x: any) => (typeof x === 'string' ? x : x.value))
        : f.of?.length === 1 && f.of[0].options?.list
          ? f.of[0].options.list.map((x: any) => (typeof x === 'string' ? x : x.value))
          : null
      if (list)
        for (const item of Array.isArray(v) ? v : [v])
          if (!list.includes(item))
            bad(`${d._type}.${k}: "${item}" is not an allowed value (${list.join(', ')})`)
      // nested object (houseRules)
      if (f.type === 'object' && v && typeof v === 'object') {
        const sub = new Set(f.fields.map((x: any) => x.name))
        for (const sk of Object.keys(v as object))
          if (!sub.has(sk)) bad(`${d._type}.${k}.${sk} is not a field in the schema`)
      }
    }
    // required fields present
    for (const [name, f] of fields) {
      const src = String(f.validation ?? '').toString()
      const required = /required\(\)/.test(src)
      if (required && d[name] === undefined && !(d._type === 'property' && name === 'photos'))
        bad(`${d._type} "${d.slug?.current ?? d.seedKey}" is missing required "${name}"`)
    }
  }
  console.log(
    problems
      ? `\n${problems} problem(s)`
      : `  ok   ${cap.docs.length} documents fit the schema (field names, enum values, required fields)`,
  )
  process.exitCode = problems ? 1 : 0
})()
