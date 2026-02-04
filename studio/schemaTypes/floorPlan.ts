import {defineType, defineField} from 'sanity'
import {DocumentIcon} from '@sanity/icons'
import {ImageUrlPreview} from '../components/ImageUrlPreview'
import {UrlWithLink} from '../components/UrlWithLink'

export const floorPlan = defineType({
  name: 'floorPlan',
  title: 'Floor Plan',
  type: 'document',
  icon: DocumentIcon,
  groups: [
    {name: 'basic', title: 'Basic Info', default: true},
    {name: 'specs', title: 'Specifications'},
    {name: 'pricing', title: 'Pricing'},
    {name: 'details', title: 'Details'},
  ],
  fields: [
    // Basic Info
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      group: 'basic',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'imageLink',
      title: 'Image',
      type: 'string',
      description: 'Floor plan image URL',
      group: 'basic',
      components: {
        input: ImageUrlPreview,
      },
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'basic',
      options: {
        source: 'pageLink',
        maxLength: 96,
        slugify: (input: string) => {
          // Extract the last segment from the URL as the slug
          if (!input) return ''
          try {
            const url = new URL(input)
            const pathSegments = url.pathname.split('/').filter(Boolean)
            return pathSegments[pathSegments.length - 1] || ''
          } catch {
            // If it's not a valid URL, just return empty
            return ''
          }
        },
      },
    }),
    defineField({
      name: 'communityRef',
      title: 'Community',
      type: 'reference',
      to: [{type: 'community'}],
      weak: true,
      group: 'basic',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'pageLink',
      title: 'Page Link',
      type: 'url',
      group: 'basic',
      components: {
        input: UrlWithLink,
      },
    }),

    // Specifications
    defineField({
      name: 'beds',
      title: 'Bedrooms',
      type: 'number',
      group: 'specs',
    }),
    defineField({
      name: 'baths',
      title: 'Bathrooms',
      type: 'number',
      group: 'specs',
    }),
    defineField({
      name: 'halfBaths',
      title: 'Half Baths',
      type: 'number',
      group: 'specs',
    }),
    defineField({
      name: 'sqft',
      title: 'Square Feet',
      type: 'number',
      group: 'specs',
    }),
    defineField({
      name: 'stories',
      title: 'Stories',
      type: 'number',
      group: 'specs',
    }),
    defineField({
      name: 'garage',
      title: 'Garage (Cars)',
      type: 'number',
      group: 'specs',
    }),

    // Pricing
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      group: 'pricing',
    }),
    defineField({
      name: 'minPrice',
      title: 'Min Price',
      type: 'number',
      group: 'pricing',
    }),
    defineField({
      name: 'maxPrice',
      title: 'Max Price',
      type: 'number',
      group: 'pricing',
    }),

    // Details
    defineField({
      name: 'brand',
      title: 'Brand',
      type: 'string',
      group: 'details',
      options: {
        list: [
          {title: 'Express Series®', value: 'Express Series®'},
          {title: 'Freedom Series℠', value: 'Freedom Series℠'},
          {title: 'Emerald Series®', value: 'Emerald Series®'},
          {title: 'Tradition Series℠', value: 'Tradition Series℠'},
          {title: 'Pacific Ridge Series℠', value: 'Pacific Ridge Series℠'},
        ],
      },
    }),
    defineField({
      name: 'features',
      title: 'Features',
      type: 'array',
      of: [{type: 'string'}],
      group: 'details',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      group: 'details',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      beds: 'beds',
      baths: 'baths',
      halfBaths: 'halfBaths',
      sqft: 'sqft',
      imageUrl: 'imageLink',
      communityName: 'communityRef.name',
      minPrice: 'minPrice',
      maxPrice: 'maxPrice',
      price: 'price',
    },
    prepare({title, imageUrl, communityName}) {
      return {
        title: title || 'Untitled Floor Plan',
        subtitle: communityName,
        imageUrl,
      }
    },
  },
})
