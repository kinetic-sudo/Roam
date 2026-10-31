// 12 shared hosts. No photos on purpose: the app shows an initial instead of stock portraits posing as real people.
export type SeedHost = {
  slug: string
  name: string
  bio: string
  isSuperhost: boolean
  hostingSince: string
  responseTime: 'within an hour' | 'within a few hours' | 'within a day'
  languages: string[]
}

export const hosts: SeedHost[] = [
  {
    slug: 'maya-chen',
    name: 'Maya Chen',
    bio: 'Maya looks after three stays she restored herself and still answers every message personally. She keeps a printed guide to local trails in each one.',
    isSuperhost: true,
    hostingSince: '2018-05-01',
    responseTime: 'within an hour',
    languages: ['English', 'Mandarin'],
  },
  {
    slug: 'daniel-okafor',
    name: 'Daniel Okafor',
    bio: 'Daniel grew up in the mountains and hosts cabins he would want to stay in. He leaves firewood stocked and the coffee beans fresh.',
    isSuperhost: true,
    hostingSince: '2019-02-01',
    responseTime: 'within an hour',
    languages: ['English', 'Igbo'],
  },
  {
    slug: 'sofia-rinaldi',
    name: 'Sofia Rinaldi',
    bio: 'Sofia manages family-owned villas and apartments across Italy and Portugal. She happily books restaurant tables and drivers for guests.',
    isSuperhost: true,
    hostingSince: '2017-09-01',
    responseTime: 'within a few hours',
    languages: ['English', 'Italian', 'Portuguese'],
  },
  {
    slug: 'liam-hargrove',
    name: 'Liam Hargrove',
    bio: 'Liam is a former ski instructor who now hosts mountain and city stays. He shares his favourite local spots in a short welcome note.',
    isSuperhost: false,
    hostingSince: '2021-01-01',
    responseTime: 'within a few hours',
    languages: ['English'],
  },
  {
    slug: 'priya-nair',
    name: 'Priya Nair',
    bio: 'Priya runs a small team that looks after her villas, with daily housekeeping on request. She is easiest to reach by message.',
    isSuperhost: true,
    hostingSince: '2016-11-01',
    responseTime: 'within an hour',
    languages: ['English', 'Hindi', 'Malayalam'],
  },
  {
    slug: 'mateo-alvarez',
    name: 'Mateo Alvarez',
    bio: 'Mateo hosts relaxed stays near the coast and in the city. He loves recommending a first meal for new arrivals.',
    isSuperhost: false,
    hostingSince: '2020-03-01',
    responseTime: 'within a few hours',
    languages: ['English', 'Spanish'],
  },
  {
    slug: 'hannah-lindqvist',
    name: 'Hannah Lindqvist',
    bio: 'Hannah hosts a small number of quiet stays and prefers fewer, better-kept places. Her check-in notes are famously clear.',
    isSuperhost: true,
    hostingSince: '2019-08-01',
    responseTime: 'within an hour',
    languages: ['English', 'Swedish', 'Norwegian'],
  },
  {
    slug: 'kenji-watanabe',
    name: 'Kenji Watanabe',
    bio: 'Kenji looks after traditional and modern homes and takes care over the details. He answers questions about getting around.',
    isSuperhost: true,
    hostingSince: '2018-10-01',
    responseTime: 'within a few hours',
    languages: ['English', 'Japanese'],
  },
  {
    slug: 'amara-osei',
    name: 'Amara Osei',
    bio: 'Amara hosts beach and coastal stays and lives nearby. She is happy to point guests to the best sunsets and quietest stretches of sand.',
    isSuperhost: false,
    hostingSince: '2022-04-01',
    responseTime: 'within a day',
    languages: ['English', 'Twi'],
  },
  {
    slug: 'tom-and-ellie-brooks',
    name: 'Tom and Ellie Brooks',
    bio: 'Tom and Ellie host together and keep their coastal cottages simple, warm and well stocked. They answer most messages the same day.',
    isSuperhost: true,
    hostingSince: '2017-06-01',
    responseTime: 'within a few hours',
    languages: ['English'],
  },
  {
    slug: 'isabela-santos',
    name: 'Isabela Santos',
    bio: 'Isabela hosts sunny stays on the coast and in the islands. She leaves a small welcome basket and a handwritten map.',
    isSuperhost: false,
    hostingSince: '2020-07-01',
    responseTime: 'within a few hours',
    languages: ['English', 'Portuguese', 'Spanish'],
  },
  {
    slug: 'jonas-berg',
    name: 'Jonas Berg',
    bio: 'Jonas hosts design-forward homes in warm climates and cold cities alike. He checks every stay himself before each season.',
    isSuperhost: true,
    hostingSince: '2018-01-01',
    responseTime: 'within an hour',
    languages: ['English', 'German', 'Swedish'],
  },
]
