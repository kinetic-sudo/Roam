// Tiny Portable Text builder. Keys are positional (b0, b1…) so a rerun produces identical documents.
type Part = ['h3' | 'p' | 'li', string]

export const h3 = (t: string): Part => ['h3', t]
export const p = (t: string): Part => ['p', t]
export const li = (t: string): Part => ['li', t]

export function body(...parts: Part[]) {
  return parts.map(([kind, text], i) => ({
    _type: 'block' as const,
    _key: `b${i}`,
    style: kind === 'h3' ? 'h3' : 'normal',
    ...(kind === 'li' ? {listItem: 'bullet', level: 1} : {}),
    markDefs: [] as never[],
    children: [{_type: 'span' as const, _key: `b${i}s`, text, marks: [] as string[]}],
  }))
}
