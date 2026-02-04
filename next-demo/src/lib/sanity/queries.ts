export const POSTS_QUERY = `*[_type == "post"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  excerpt,
  publishedAt,
  mainImage,
  "author": author->{
    name,
    slug,
    image,
    bio
  },
  "categories": categories[]->{
    _id,
    title,
    slug
  }
}`

export const POST_BY_SLUG_QUERY = `*[_type == "post" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  excerpt,
  publishedAt,
  mainImage,
  body,
  "author": author->{
    name,
    slug,
    image,
    bio
  },
  "categories": categories[]->{
    _id,
    title,
    slug
  }
}`

export const ALL_POST_SLUGS_QUERY = `*[_type == "post" && defined(slug.current)].slug.current`

export const AUTHORS_QUERY = `*[_type == "author"] {
  _id,
  name,
  slug,
  image,
  bio
}`

export const CATEGORIES_QUERY = `*[_type == "category"] {
  _id,
  title,
  slug,
  description
}`

export const RELATED_POSTS_QUERY = `*[_type == "post" && _id != $postId && count((categories[]->_id)[@ in $categoryIds]) > 0] | order(publishedAt desc) [0...3] {
  _id,
  title,
  slug,
  excerpt,
  publishedAt,
  mainImage,
  "author": author->{
    name,
    slug,
    image,
    bio
  },
  "categories": categories[]->{
    _id,
    title,
    slug
  }
}`

export const STATES_QUERY = `*[_type == "state"] | order(name asc) {
  _id,
  name
}`

export const STATE_BY_NAME_QUERY = `*[_type == "state" && lower(name) == lower($name)][0] {
  _id,
  name
}`

export const ALL_STATE_NAMES_QUERY = `*[_type == "state" && defined(name)].name`

export const AREAS_QUERY = `*[_type == "areas"] | order(name asc) {
  _id,
  name,
  title,
  url,
  "state": stateRef->{
    _id,
    name
  },
  breadcrumb
}`

export const COMMUNITIES_BY_STATE_QUERY = `*[_type == "community" && stateRef->name == $stateName] | order(name asc) {
  _id,
  name,
  imageLink,
  "state": stateRef->{
    _id,
    name
  },
  address,
  brand,
  pageLink,
  sellingStatus,
  availableHomes,
  minBeds,
  maxBeds,
  minBaths,
  maxBaths,
  minCars,
  maxCars,
  minStories,
  maxStories,
  minSqft,
  maxSqft,
  minPrice,
  maxPrice,
  callForPrice,
  amenities,
  propertyType
}`

export const COMMUNITY_BY_ID_QUERY = `*[_type == "community" && _id == $id][0] {
  _id,
  name,
  imageLink,
  "state": stateRef->{
    _id,
    name
  },
  address,
  brand,
  pageLink,
  sellingStatus,
  availableHomes,
  minBeds,
  maxBeds,
  minBaths,
  maxBaths,
  minCars,
  maxCars,
  minStories,
  maxStories,
  minSqft,
  maxSqft,
  minPrice,
  maxPrice,
  callForPrice,
  amenities,
  propertyType
}`

export const COMMUNITY_WITH_HOUSES_QUERY = `{
  "community": *[_type == "community" && _id == $id][0] {
    _id,
    name,
    imageLink,
    "state": stateRef->{
      _id,
      name
    },
    address,
    brand,
    pageLink,
    sellingStatus,
    availableHomes,
    minBeds,
    maxBeds,
    minBaths,
    maxBaths,
    minCars,
    maxCars,
    minStories,
    maxStories,
    minSqft,
    maxSqft,
    minPrice,
    maxPrice,
    callForPrice,
    amenities,
    propertyType
  },
  "houses": *[_type == "house" && communityRef._ref == $id] | order(address asc) {
    _id,
    address,
    imageLink,
    price,
    beds,
    baths,
    halfBaths,
    sqft,
    status,
    floorPlanName,
    "community": communityRef->{
      _id,
      name
    }
  }
}`

export const STATE_WITH_COMMUNITIES_QUERY = `{
  "state": *[_type == "state" && lower(name) == lower($name)][0] {
    _id,
    name
  },
  "communities": *[_type == "community" && lower(stateRef->name) == lower($name)] | order(name asc) {
    _id,
    name,
    imageLink,
    "state": stateRef->{
      _id,
      name
    },
    address,
    brand,
    pageLink,
    sellingStatus,
    availableHomes,
    minBeds,
    maxBeds,
    minBaths,
    maxBaths,
    minCars,
    maxCars,
    minStories,
    maxStories,
    minSqft,
    maxSqft,
    minPrice,
    maxPrice,
    callForPrice,
    amenities,
    propertyType
  }
}`

export const ALL_COMMUNITY_IDS_QUERY = `*[_type == "community" && defined(_id)]._id`

export const ALL_COMMUNITIES_QUERY = `*[_type == "community"] | order(name asc) {
  _id,
  name,
  imageLink,
  "state": stateRef->{
    _id,
    name
  },
  address,
  brand,
  pageLink,
  sellingStatus,
  availableHomes,
  minPrice,
  maxPrice,
  amenities,
  propertyType
}`

export const HOUSE_BY_ID_QUERY = `*[_type == "house" && _id == $id][0] {
  _id,
  address,
  "community": communityRef->{
    _id,
    name,
    "state": stateRef->{ _id, name }
  },
  "floorPlan": floorPlanRef->{
    _id,
    name,
    slug,
    imageLink,
    beds,
    baths,
    sqft
  },
  pageLink,
  imageLink,
  price,
  status,
  moveInDate,
  moveInStatus,
  floorPlanName,
  beds,
  baths,
  halfBaths,
  sqft,
  stories,
  garage,
  lot,
  brand,
  features,
  photos
}`

export const ALL_HOUSE_IDS_QUERY = `*[_type == "house" && defined(_id)]._id`

export const ALL_HOUSES_QUERY = `*[_type == "house"] | order(address asc) {
  _id,
  address,
  "community": communityRef->{
    _id,
    name,
    "state": stateRef->{ _id, name }
  },
  "floorPlan": floorPlanRef->{
    _id,
    name
  },
  pageLink,
  imageLink,
  price,
  status,
  moveInStatus,
  floorPlanName,
  beds,
  baths,
  sqft
}`
