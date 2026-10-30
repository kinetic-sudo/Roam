import { UserIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

/** Shared across stays: one host can run several. */
export const host = defineType({
  name: 'host',
  title: 'Host',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: "Seed key. Don't change it on seeded hosts.",
      options: {source: 'name', maxLength: 64},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: {hotspot: true},
      description: "Optional. Without one, the app shows the host's initial.",
    }),
    defineField({name: 'bio', title: 'Bio', type: 'text', rows: 3}),
    defineField({name: 'isSuperhost', title: 'Superhost', type: 'boolean', initialValue: false}),
    defineField({name: 'hostingSince', title: 'Hosting since', type: 'date'}),
    defineField({
      name: 'responseTime',
      title: 'Response time',
      type: 'string',
      options: {
        list: [
          {title: 'Within an hour', value: 'within an hour'},
          {title: 'Within a few hours', value: 'within a few hours'},
          {title: 'Within a day', value: 'within a day'},
        ],
      },
    }),
    defineField({
      name: 'languages',
      title: 'Languages',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
    }),
  ],
  preview: {
    select: {title: 'name', isSuperhost: 'isSuperhost', media: 'photo'},
    prepare: ({title, isSuperhost, media}) => ({
      title,
      subtitle: isSuperhost ? 'Superhost' : 'Host',
      media,
    }),
  },
})
