import { DocumentTextIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

export const POLICY_KINDS = [
  {title: 'Cancellation', value: 'cancellation'},
  {title: 'Booking & payment', value: 'booking'},
  {title: 'Payment', value: 'payment'},
  {title: 'Pets', value: 'pets'},
  {title: 'Damage & deposit', value: 'damage'},
  {title: 'Check-in & check-out', value: 'checkIn'},
  {title: 'Guest refund', value: 'guestRefund'},
] as const

/**
 * Shared policy documents. The three cancellation tiers are referenced by stays;
 * the general Roam policies apply to every stay, so nothing references them.
 * Body is plain paragraphs, h3 headings and bullet lists, so a future Context endpoint can quote whole paragraphs.
 */
export const policy = defineType({
  name: 'policy',
  title: 'Policy',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: "Seed key. Don't change it on seeded policies.",
      options: {source: 'title', maxLength: 64},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'kind',
      title: 'Kind',
      type: 'string',
      options: {list: [...POLICY_KINDS]},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'string',
      description: 'One line.',
      validation: (r) => r.max(140),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'Heading 3', value: 'h3'},
          ],
          lists: [{title: 'Bullet', value: 'bullet'}],
          marks: {decorators: [], annotations: []},
        }),
      ],
    }),
  ],
  preview: {select: {title: 'title', subtitle: 'kind'}},
})
