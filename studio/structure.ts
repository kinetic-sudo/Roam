import type { StructureResolver } from 'sanity/structure'

// Studio sidebar: Stays, Hosts, Policies, Reviews. Wire it in sanity.config.ts:
//   structureTool({ structure })
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Roam')
    .items([
      S.documentTypeListItem('property').title('Stays'),
      S.documentTypeListItem('host').title('Hosts'),
      S.documentTypeListItem('policy').title('Policies'),
      S.documentTypeListItem('review').title('Reviews'),
    ])
