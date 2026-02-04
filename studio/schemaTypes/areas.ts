import {defineType, defineField} from 'sanity'

export const areas = defineType({
  name: 'areas',
  title: 'Areas',
  type: 'document',
  icon: () => '📍',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'The display name of the area (e.g., "Bay Area")',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'stateRef',
      title: 'State',
      type: 'reference',
      to: [{type: 'state'}],
      weak: true,
      description: 'The state this area belongs to',
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Title used for the area page',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'string',
      description: 'The URL path for this area (e.g., "/california/bay-area")',
      validation: (rule) =>
        rule.required().custom((url) => {
          if (!url) return true
          if (!url.startsWith('/')) {
            return 'URL must start with /'
          }
          return true
        }),
    }),
    defineField({
      name: 'itemPath',
      title: 'Item Path',
      type: 'string',
      description: 'Sitecore item path reference',
    }),
    defineField({
      name: 'owningTeam',
      title: 'Owning Team',
      type: 'string',
      description: 'The team responsible for this area',
    }),
    defineField({
      name: 'breadcrumb',
      title: 'Breadcrumb',
      type: 'string',
      description: 'Breadcrumb navigation path (e.g., "/California/Bay Area")',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'object',
      description: 'Geographic coordinates and map settings',
      fields: [
        defineField({
          name: 'latitude',
          title: 'Latitude',
          type: 'number',
          validation: (rule) => rule.required().min(-90).max(90),
        }),
        defineField({
          name: 'longitude',
          title: 'Longitude',
          type: 'number',
          validation: (rule) => rule.required().min(-180).max(180),
        }),
        defineField({
          name: 'radius',
          title: 'Radius',
          type: 'number',
          description: 'Radius in miles for the area coverage',
          validation: (rule) => rule.required().min(0),
        }),
        defineField({
          name: 'zoomLevel',
          title: 'Zoom Level',
          type: 'number',
          description: 'Default map zoom level',
          validation: (rule) => rule.required().min(1).max(20),
        }),
      ],
    }),
    defineField({
      name: 'areaInfoContent',
      title: 'Area Info Content',
      type: 'text',
      description: 'HTML content describing the area',
      rows: 10,
    }),
    defineField({
      name: 'rteData',
      title: 'RTE Data',
      type: 'object',
      description: 'Real-time event data',
      fields: [
        defineField({
          name: 'status',
          title: 'Status',
          type: 'string',
          options: {
            list: [
              {title: 'None', value: 'None'},
              {title: 'Active', value: 'Active'},
              {title: 'Pending', value: 'Pending'},
            ],
            layout: 'radio',
          },
          initialValue: 'None',
        }),
        defineField({
          name: 'countDown',
          title: 'Count Down',
          type: 'string',
          description: 'Countdown timer value',
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
        title: title || 'Untitled Area',
      }
    },
  },
})
