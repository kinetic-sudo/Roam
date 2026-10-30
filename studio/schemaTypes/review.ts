import { CommentIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const review = defineType({
  name: 'review',
  title: 'Review',
  type: 'document',
  icon: CommentIcon,
  fields: [
    defineField({
      name: 'property',
      title: 'Stay',
      type: 'reference',
      to: [{type: 'property'}],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'guestName',
      title: 'Guest (first name only)',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'rating',
      title: 'Rating',
      type: 'number',
      validation: (r) => r.required().integer().min(1).max(5),
    }),
    defineField({
      name: 'stayedAt',
      title: 'Stayed',
      type: 'date',
      options: {dateFormat: 'MMMM YYYY'},
    }),
    defineField({
      name: 'text',
      title: 'Review',
      type: 'text',
      rows: 3,
      validation: (r) => r.required(),
    }),
    defineField({name: 'seedKey', title: 'Seed key', type: 'string', hidden: true, readOnly: true}),
  ],
  preview: {
    select: {title: 'guestName', rating: 'rating', stay: 'property.title', text: 'text'},
    prepare: ({title, rating, stay, text}) => ({
      title: `${title} · ${rating}★`,
      subtitle: `${stay ?? 'Stay'}: ${text ?? ''}`,
    }),
  },
})
