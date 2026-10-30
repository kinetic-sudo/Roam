import { HomeIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

/** Fixed amenity list: guest filters key off these values, so they are never free text. */
export const AMENITIES = [
  {title: 'Hot tub', value: 'hotTub'},
  {title: 'Pool', value: 'pool'},
  {title: 'Fireplace', value: 'fireplace'},
  {title: 'Fire pit', value: 'firePit'},
  {title: 'Sauna', value: 'sauna'},
  {title: 'Wifi', value: 'wifi'},
  {title: 'Kitchen', value: 'kitchen'},
  {title: 'Workspace', value: 'workspace'},
  {title: 'Parking', value: 'parking'},
  {title: 'Washer', value: 'washer'},
  {title: 'Air conditioning', value: 'ac'},
  {title: 'Ocean view', value: 'oceanView'},
  {title: 'Lake view', value: 'lakeView'},
  {title: 'Beach access', value: 'beachAccess'},
  {title: 'Mountain view', value: 'mountainView'},
  {title: 'BBQ', value: 'bbq'},
  {title: 'EV charger', value: 'evCharger'},
] as const

const wholeNumber =
  (min = 0) =>
  (r: any) =>
    r.required().integer().min(min)

/**
 * A stay.
 *  - Everything guests filter on is a typed field (type, price, guests, rooms, amenities, pets, place).
 *  - Descriptive text (summary, description, highlights, vibes, facts, neighborhood) lives here, on the
 *    property itself, because dataset embeddings only see the document being embedded.
 *  - Hosts and policies are shared documents, referenced.
 */
export const property = defineType({
  name: 'property',
  title: 'Stay',
  type: 'document',
  icon: HomeIcon,
  groups: [
    {name: 'basics', title: 'Basics', default: true},
    {name: 'place', title: 'Place'},
    {name: 'layout', title: 'Layout'},
    {name: 'price', title: 'Price'},
    {name: 'rules', title: 'Rules'},
    {name: 'copy', title: 'Copy'},
    {name: 'media', title: 'Media'},
  ],
  fields: [
    // ---- Basics
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'basics',
      validation: (r) => r.required().max(60),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'basics',
      description: 'Seed key and the future /stay/[slug] route.',
      options: {source: 'title', maxLength: 80},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      group: 'basics',
      options: {
        layout: 'radio',
        list: [
          {title: 'Cabin', value: 'cabin'},
          {title: 'Beach', value: 'beach'},
          {title: 'City', value: 'city'},
          {title: 'Villa', value: 'villa'},
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'host',
      title: 'Host',
      type: 'reference',
      group: 'basics',
      to: [{type: 'host'}],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'cancellationPolicy',
      title: 'Cancellation policy',
      type: 'reference',
      group: 'basics',
      to: [{type: 'policy'}],
      options: {filter: 'kind == "cancellation"'},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'rating',
      title: 'Rating',
      type: 'number',
      group: 'basics',
      description: 'Stored aggregate.',
      validation: (r) => r.min(0).max(5).precision(2),
    }),
    defineField({
      name: 'reviewCount',
      title: 'Review count',
      type: 'number',
      group: 'basics',
      description: 'Stored aggregate.',
      validation: (r) => r.integer().min(0),
    }),

    // ---- Place
    defineField({
      name: 'city',
      title: 'City',
      type: 'string',
      group: 'place',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'region',
      title: 'Region / state',
      type: 'string',
      group: 'place',
      description: 'Shown as "city, region" when set (e.g. CA, Bali).',
    }),
    defineField({
      name: 'country',
      title: 'Country',
      type: 'string',
      group: 'place',
      validation: (r) => r.required(),
    }),
    defineField({name: 'neighborhood', title: 'Neighborhood', type: 'string', group: 'place'}),
    defineField({name: 'location', title: 'Map pin', type: 'geopoint', group: 'place'}),

    // ---- Layout
    defineField({
      name: 'maxGuests',
      title: 'Max guests',
      type: 'number',
      group: 'layout',
      validation: wholeNumber(1),
    }),
    defineField({
      name: 'bedrooms',
      title: 'Bedrooms',
      type: 'number',
      group: 'layout',
      description: '0 for a studio.',
      validation: wholeNumber(0),
    }),
    defineField({
      name: 'beds',
      title: 'Beds',
      type: 'number',
      group: 'layout',
      validation: wholeNumber(0),
    }),
    defineField({
      name: 'bathrooms',
      title: 'Bathrooms',
      type: 'number',
      group: 'layout',
      validation: (r) =>
        r
          .required()
          .min(0)
          .custom((v) => v === undefined || (v * 2) % 1 === 0 || 'Use whole or half bathrooms'),
    }),
    defineField({
      name: 'amenities',
      title: 'Amenities',
      type: 'array',
      group: 'layout',
      of: [defineArrayMember({type: 'string'})],
      options: {list: [...AMENITIES]},
      validation: (r) => r.unique(),
    }),

    // ---- Price
    defineField({
      name: 'pricePerNight',
      title: 'Price per night (USD)',
      type: 'number',
      group: 'price',
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: 'cleaningFee',
      title: 'Cleaning fee (USD)',
      type: 'number',
      group: 'price',
      validation: (r) => r.min(0),
    }),
    defineField({
      name: 'minNights',
      title: 'Minimum nights',
      type: 'number',
      group: 'price',
      validation: (r) => r.integer().min(1),
    }),
    defineField({
      name: 'weeklyDiscountPercent',
      title: 'Weekly discount (%)',
      type: 'number',
      group: 'price',
      validation: (r) => r.min(0).max(50),
    }),

    // ---- Rules
    defineField({
      name: 'houseRules',
      title: 'House rules',
      type: 'object',
      group: 'rules',
      options: {collapsible: false},
      fields: [
        defineField({
          name: 'checkInTime',
          title: 'Check-in',
          type: 'string',
          description: '24h, e.g. 15:00',
          initialValue: '15:00',
        }),
        defineField({
          name: 'checkOutTime',
          title: 'Check-out',
          type: 'string',
          description: '24h, e.g. 11:00',
          initialValue: '11:00',
        }),
        defineField({name: 'quietHoursFrom', title: 'Quiet hours from', type: 'string'}),
        defineField({name: 'quietHoursTo', title: 'Quiet hours to', type: 'string'}),
        defineField({
          name: 'petsAllowed',
          title: 'Pets allowed',
          type: 'boolean',
          initialValue: false,
        }),
        defineField({
          name: 'maxPets',
          title: 'Max pets',
          type: 'number',
          hidden: ({parent}) => !parent?.petsAllowed,
          validation: (r) => r.integer().min(1),
        }),
        defineField({
          name: 'petFee',
          title: 'Pet fee (USD per stay)',
          type: 'number',
          hidden: ({parent}) => !parent?.petsAllowed,
          validation: (r) => r.min(0),
        }),
        defineField({
          name: 'smokingAllowed',
          title: 'Smoking allowed',
          type: 'boolean',
          initialValue: false,
        }),
        defineField({
          name: 'partiesAllowed',
          title: 'Parties allowed',
          type: 'boolean',
          initialValue: false,
        }),
        defineField({
          name: 'additionalRules',
          title: 'Additional rules',
          type: 'array',
          of: [{type: 'string'}],
        }),
      ],
    }),

    // ---- Copy (embedded)
    defineField({
      name: 'vibes',
      title: 'Vibes',
      type: 'array',
      group: 'copy',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
      description: 'Soft words: quiet, cozy, lively…',
    }),
    defineField({
      name: 'facts',
      title: 'Facts',
      type: 'array',
      group: 'copy',
      of: [{type: 'string'}],
      description:
        'The stay\'s own facts, the only source for copy. e.g. "Cedar hot tub on the back deck".',
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'string',
      group: 'copy',
      description: 'One line, shown on result cards.',
      validation: (r) => r.max(90),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 5,
      group: 'copy',
      description: '3–5 sentences.',
    }),
    defineField({
      name: 'highlights',
      title: 'Highlights',
      type: 'array',
      group: 'copy',
      of: [{type: 'string'}],
      validation: (r) => r.max(4),
    }),
    defineField({
      name: 'copyReview',
      title: 'Copy review',
      type: 'object',
      group: 'copy',
      readOnly: true,
      description: 'Written by the copy checker. Agent Actions skip read-only fields.',
      fields: [
        defineField({name: 'status', type: 'string', options: {list: ['passed', 'failed']}}),
        defineField({name: 'checkedAt', type: 'datetime'}),
        defineField({name: 'sourceHash', type: 'string'}),
        defineField({name: 'unsupportedClaims', type: 'array', of: [{type: 'string'}]}),
      ],
    }),

    // ---- Media
    defineField({
      name: 'photos',
      title: 'Photos',
      type: 'array',
      group: 'media',
      description: 'The first photo is the cover.',
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt text',
              type: 'string',
              validation: (r) => r.required(),
            }),
          ],
        }),
      ],
      validation: (r) => r.min(1),
    }),
  ],
  preview: {
    select: {title: 'title', city: 'city', price: 'pricePerNight', media: 'photos.0'},
    prepare: ({title, city, price, media}) => ({
      title,
      subtitle: `${city ?? ''} · $${price ?? '?'}`,
      media,
    }),
  },
})
