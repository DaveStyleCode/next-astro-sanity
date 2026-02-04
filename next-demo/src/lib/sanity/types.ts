export interface SanityPost {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string
  publishedAt?: string
  mainImage?: { asset?: unknown; alt?: string }
  author?: {
    name: string
    slug: { current: string }
    image?: { asset?: unknown }
    bio?: string
  }
  categories?: Array<{
    _id: string
    title: string
    slug: { current: string }
  }>
  body?: Array<Record<string, unknown>>
}

export interface SanityAuthor {
  _id: string
  name: string
  slug: { current: string }
  image?: { asset?: unknown }
  bio?: string
}

export interface SanityCategory {
  _id: string
  title: string
  slug: { current: string }
  description?: string
}

export interface SanityState {
  _id: string
  name: string
}

export interface SanityArea {
  _id: string
  name: string
  title?: string
  url?: string
  state?: SanityState
  breadcrumb?: string
}

export interface SanityCommunity {
  _id: string
  name: string
  imageLink?: string
  state?: SanityState
  address?: string
  brand?: string
  pageLink?: string
  sellingStatus?: string
  availableHomes?: number
  minBeds?: number
  maxBeds?: number
  minBaths?: number
  maxBaths?: number
  minCars?: number
  maxCars?: number
  minStories?: number
  maxStories?: number
  minSqft?: number
  maxSqft?: number
  minPrice?: number
  maxPrice?: number
  callForPrice?: boolean
  amenities?: string[]
  propertyType?: string
}

export interface SanityFloorPlan {
  _id: string
  name: string
  slug?: { current: string }
  community?: SanityCommunity
  pageLink?: string
  imageLink?: string
  beds?: number
  baths?: number
  halfBaths?: number
  sqft?: number
  stories?: number
  garage?: number
  price?: number
  minPrice?: number
  maxPrice?: number
  brand?: string
  features?: string[]
  description?: string
}

export interface SanityHouse {
  _id: string
  address: string
  community?: SanityCommunity
  floorPlan?: SanityFloorPlan
  pageLink?: string
  imageLink?: string
  price?: number
  status?: string
  moveInDate?: string
  moveInStatus?: string
  floorPlanName?: string
  beds?: number
  baths?: number
  halfBaths?: number
  sqft?: number
  stories?: number
  garage?: number
  lot?: string
  brand?: string
  features?: string[]
  photos?: string[]
}
