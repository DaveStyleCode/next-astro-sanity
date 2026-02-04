import {defineType, defineField} from 'sanity'
import {HomeIcon} from '@sanity/icons'
import {ImageUrlPreview} from '../components/ImageUrlPreview'
import {UrlWithLink} from '../components/UrlWithLink'

export const house = defineType({
  name: 'house',
  title: 'House (QMI)',
  type: 'document',
  icon: HomeIcon,
  groups: [
    {
      name: 'basic',
      title: 'Basic Information',
      default: true,
    },
    {
      name: 'pricing',
      title: 'Pricing & Availability',
    },
    {
      name: 'specs',
      title: 'Specs',
    },
    {
      name: 'details',
      title: 'Details & Media',
    },
  ],
  fields: [
    defineField({
      name: 'address',
      title: 'Address',
      type: 'string',
      validation: (rule) => rule.required(),
      group: 'basic',
    }),
    defineField({
      name: 'city',
      title: 'City',
      type: 'string',
      group: 'basic',
    }),
    defineField({
      name: 'state',
      title: 'State',
      type: 'string',
      description: 'Two-letter state code (e.g., TX, CA)',
      group: 'basic',
    }),
    defineField({
      name: 'zip',
      title: 'ZIP Code',
      type: 'string',
      group: 'basic',
    }),
    defineField({
      name: 'imageLink',
      title: 'Image',
      type: 'string',
      description: 'House image URL',
      components: {
        input: ImageUrlPreview,
      },
      group: 'basic',
    }),
    defineField({
      name: 'communityRef',
      title: 'Community',
      type: 'reference',
      to: [{type: 'community'}],
      weak: true,
      validation: (rule) => rule.required(),
      group: 'basic',
    }),
    defineField({
      name: 'floorPlanRef',
      title: 'Floor Plan',
      type: 'reference',
      to: [{type: 'floorPlan'}],
      weak: true,
      group: 'basic',
    }),
    defineField({
      name: 'pageLink',
      title: 'Page Link',
      type: 'url',
      components: {
        input: UrlWithLink,
      },
      group: 'basic',
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      group: 'pricing',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Available', value: 'Available'},
          {title: 'Under Contract', value: 'Under Contract'},
          {title: 'Sold', value: 'Sold'},
          {title: 'Model Home', value: 'Model Home'},
        ],
      },
      group: 'pricing',
    }),
    defineField({
      name: 'moveInDate',
      title: 'Move-In Date',
      type: 'date',
      group: 'pricing',
    }),
    defineField({
      name: 'moveInStatus',
      title: 'Move-In Status',
      type: 'string',
      description: 'e.g., "Move-In Ready", "Est. May 2025"',
      group: 'pricing',
    }),
    defineField({
      name: 'floorPlanName',
      title: 'Floor Plan Name',
      type: 'string',
      description: 'Name of the floor plan (for display if not linked)',
      deprecated: {
        reason: 'This field is deprecated. Use the floorPlanRef field instead.',
      },
      group: 'basic',
    }),
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
    defineField({
      name: 'lot',
      title: 'Lot',
      type: 'string',
      group: 'specs',
    }),
    defineField({
      name: 'brand',
      title: 'Brand',
      type: 'string',
      options: {
        list: [
          {title: 'Express Series®', value: 'Express Series®'},
          {title: 'Freedom Series℠', value: 'Freedom Series℠'},
          {title: 'Emerald Series®', value: 'Emerald Series®'},
          {title: 'Tradition Series℠', value: 'Tradition Series℠'},
          {title: 'Pacific Ridge Series℠', value: 'Pacific Ridge Series℠'},
        ],
      },
      group: 'details',
    }),
    defineField({
      name: 'features',
      title: 'Features',
      type: 'array',
      of: [{type: 'string'}],
      group: 'details',
    }),
    defineField({
      name: 'photos',
      title: 'Photos',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Array of external photo URLs',
      group: 'details',
    }),
  ],
  preview: {
    select: {
      title: 'address',
      price: 'price',
      status: 'status',
      imageUrl: 'imageLink',
      communityName: 'communityRef.name',
      beds: 'beds',
      baths: 'baths',
      halfBaths: 'halfBaths',
      sqft: 'sqft',
      moveInStatus: 'moveInStatus',
    },
    prepare({title, imageUrl, communityName}) {
      return {
        title: title || 'Untitled House',
        subtitle: communityName,
        imageUrl,
      }
    },
  },
})
