import {defineType, defineField} from 'sanity'
import {StateFlagPreview} from '../components/StateFlagPreview'

// Helper to title case a string
function toTitleCase(str: string) {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export const state = defineType({
  name: 'state',
  title: 'State',
  type: 'document',
  icon: () => '🇺🇸',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'coordinates',
      title: 'Coordinates',
      type: 'object',
      description: 'Geographic coordinates for the state',
      fields: [
        defineField({
          name: 'latitude',
          title: 'Latitude',
          type: 'number',
        }),
        defineField({
          name: 'longitude',
          title: 'Longitude',
          type: 'number',
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'name',
    },
    prepare({title}) {
      return {
        title: title ? toTitleCase(title) : 'Untitled',
        media: title ? StateFlagPreview({stateName: title}) : undefined,
      }
    },
  },
})
