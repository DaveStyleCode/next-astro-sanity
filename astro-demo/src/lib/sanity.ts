import { sanityClient } from "sanity:client";
import {
  createImageUrlBuilder,
  type SanityImageSource,
} from "@sanity/image-url";

// Create a draft-aware client
export const draftClient = sanityClient.withConfig({
  perspective: "previewDrafts",
  useCdn: false,
  token: import.meta.env.SANITY_TOKEN,
});

// Helper to get the right client based on draft mode
export function getClient(draftMode: boolean = false) {
  return draftMode ? draftClient : sanityClient;
}

// Image URL builder
const builder = createImageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

// Check if an image has an actual asset (not just metadata)
export function hasImageAsset(
  image: unknown,
): image is SanityImageSource & { asset: unknown } {
  return !!(
    image &&
    typeof image === "object" &&
    "asset" in image &&
    image.asset
  );
}

// Types
export interface SanityPost {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  publishedAt?: string;
  mainImage?: SanityImageSource & { alt?: string };
  author?: {
    name: string;
    slug: { current: string };
    image?: SanityImageSource;
    bio?: string;
  };
  categories?: Array<{
    _id: string;
    title: string;
    slug: { current: string };
  }>;
  body?: Array<Record<string, unknown>>;
}

export interface SanityAuthor {
  _id: string;
  name: string;
  slug: { current: string };
  image?: SanityImageSource;
  bio?: string;
}

export interface SanityCategory {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
}

export interface SanityState {
  _id: string;
  name: string;
}

export interface SanityArea {
  _id: string;
  name: string;
  title?: string;
  url?: string;
  state?: SanityState;
  breadcrumb?: string;
}

export interface SanityCommunity {
  _id: string;
  name: string;
  imageLink?: string;
  state?: SanityState;
  address?: string;
  brand?: string;
  pageLink?: string;
  sellingStatus?: string;
  availableHomes?: number;
  minBeds?: number;
  maxBeds?: number;
  minBaths?: number;
  maxBaths?: number;
  minCars?: number;
  maxCars?: number;
  minStories?: number;
  maxStories?: number;
  minSqft?: number;
  maxSqft?: number;
  minPrice?: number;
  maxPrice?: number;
  callForPrice?: boolean;
  amenities?: string[];
  propertyType?: string;
}

export interface SanityFloorPlan {
  _id: string;
  name: string;
  slug?: { current: string };
  community?: SanityCommunity;
  pageLink?: string;
  imageLink?: string;
  beds?: number;
  baths?: number;
  halfBaths?: number;
  sqft?: number;
  stories?: number;
  garage?: number;
  price?: number;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  features?: string[];
  description?: string;
}

export interface SanityHouse {
  _id: string;
  address: string;
  community?: SanityCommunity;
  floorPlan?: SanityFloorPlan;
  pageLink?: string;
  imageLink?: string;
  price?: number;
  status?: string;
  moveInDate?: string;
  moveInStatus?: string;
  floorPlanName?: string;
  beds?: number;
  baths?: number;
  halfBaths?: number;
  sqft?: number;
  stories?: number;
  garage?: number;
  lot?: string;
  brand?: string;
  features?: string[];
  photos?: string[];
}

// Queries
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
}`;

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
}`;

export const ALL_POST_SLUGS_QUERY = `*[_type == "post" && defined(slug.current)].slug.current`;

export const AUTHORS_QUERY = `*[_type == "author"] {
  _id,
  name,
  slug,
  image,
  bio
}`;

export const CATEGORIES_QUERY = `*[_type == "category"] {
  _id,
  title,
  slug,
  description
}`;

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
}`;

// State and Community queries
export const STATES_QUERY = `*[_type == "state"] | order(name asc) {
  _id,
  name
}`;

export const STATE_BY_NAME_QUERY = `*[_type == "state" && lower(name) == lower($name)][0] {
  _id,
  name
}`;

export const ALL_STATE_NAMES_QUERY = `*[_type == "state" && defined(name)].name`;

// Area queries
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
}`;

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
}`;

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
}`;

export const ALL_COMMUNITY_IDS_QUERY = `*[_type == "community" && defined(_id)]._id`;

// All communities query (for search)
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
}`;

// Floor Plan queries
export const FLOOR_PLANS_BY_COMMUNITY_QUERY = `*[_type == "floorPlan" && communityRef._ref == $communityId] | order(name asc) {
  _id,
  name,
  slug,
  "community": communityRef->{
    _id,
    name,
    "state": stateRef->{ _id, name }
  },
  pageLink,
  imageLink,
  beds,
  baths,
  halfBaths,
  sqft,
  stories,
  garage,
  price,
  minPrice,
  maxPrice,
  brand,
  features,
  description
}`;

export const FLOOR_PLAN_BY_ID_QUERY = `*[_type == "floorPlan" && _id == $id][0] {
  _id,
  name,
  slug,
  "community": communityRef->{
    _id,
    name,
    "state": stateRef->{ _id, name }
  },
  pageLink,
  imageLink,
  beds,
  baths,
  halfBaths,
  sqft,
  stories,
  garage,
  price,
  minPrice,
  maxPrice,
  brand,
  features,
  description
}`;

export const ALL_FLOOR_PLAN_IDS_QUERY = `*[_type == "floorPlan" && defined(_id)]._id`;

// House/QMI queries
export const HOUSES_BY_COMMUNITY_QUERY = `*[_type == "house" && communityRef._ref == $communityId] | order(address asc) {
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
    slug
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
}`;

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
}`;

export const ALL_HOUSE_IDS_QUERY = `*[_type == "house" && defined(_id)]._id`;

// All houses query (for search)
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
}`;

export const AVAILABLE_HOUSES_QUERY = `*[_type == "house" && status == "Available"] | order(price asc) {
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
}`;

// Fetch functions
export async function getPosts(): Promise<SanityPost[]> {
  return await sanityClient.fetch(POSTS_QUERY);
}

export async function getPostBySlug(slug: string): Promise<SanityPost | null> {
  return await sanityClient.fetch(POST_BY_SLUG_QUERY, { slug });
}

export async function getRelatedPosts(
  postId: string,
  categoryIds: string[],
): Promise<SanityPost[]> {
  if (categoryIds.length === 0) return [];
  return await sanityClient.fetch(RELATED_POSTS_QUERY, { postId, categoryIds });
}

export async function getAllPostSlugs(): Promise<string[]> {
  return await sanityClient.fetch(ALL_POST_SLUGS_QUERY);
}

export async function getAuthors(): Promise<SanityAuthor[]> {
  return await sanityClient.fetch(AUTHORS_QUERY);
}

export async function getCategories(): Promise<SanityCategory[]> {
  return await sanityClient.fetch(CATEGORIES_QUERY);
}

export async function getStates(): Promise<SanityState[]> {
  return await sanityClient.fetch(STATES_QUERY);
}

export async function getStateByName(
  name: string,
): Promise<SanityState | null> {
  return await sanityClient.fetch(STATE_BY_NAME_QUERY, { name });
}

export async function getAllStateNames(): Promise<string[]> {
  return await sanityClient.fetch(ALL_STATE_NAMES_QUERY);
}

export async function getAreas(): Promise<SanityArea[]> {
  return await sanityClient.fetch(AREAS_QUERY);
}

export async function getCommunitiesByState(
  stateName: string,
): Promise<SanityCommunity[]> {
  return await sanityClient.fetch(COMMUNITIES_BY_STATE_QUERY, { stateName });
}

// Combined query for state page - fetches state and communities in a single request
// This eliminates the waterfall of two sequential queries for better LCP
export async function getStateWithCommunities(
  name: string,
): Promise<{ state: SanityState | null; communities: SanityCommunity[] }> {
  const query = `{
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
  }`;
  return await sanityClient.fetch(query, { name });
}

export async function getCommunityById(
  id: string,
): Promise<SanityCommunity | null> {
  return await sanityClient.fetch(COMMUNITY_BY_ID_QUERY, { id });
}

export async function getAllCommunityIds(): Promise<string[]> {
  return await sanityClient.fetch(ALL_COMMUNITY_IDS_QUERY);
}

export async function getAllCommunities(): Promise<SanityCommunity[]> {
  return await sanityClient.fetch(ALL_COMMUNITIES_QUERY);
}

// Floor Plan fetch functions
export async function getFloorPlansByCommunity(
  communityId: string,
): Promise<SanityFloorPlan[]> {
  return await sanityClient.fetch(FLOOR_PLANS_BY_COMMUNITY_QUERY, {
    communityId,
  });
}

export async function getFloorPlanById(
  id: string,
): Promise<SanityFloorPlan | null> {
  return await sanityClient.fetch(FLOOR_PLAN_BY_ID_QUERY, { id });
}

export async function getAllFloorPlanIds(): Promise<string[]> {
  return await sanityClient.fetch(ALL_FLOOR_PLAN_IDS_QUERY);
}

// House fetch functions
export async function getHousesByCommunity(
  communityId: string,
): Promise<SanityHouse[]> {
  return await sanityClient.fetch(HOUSES_BY_COMMUNITY_QUERY, { communityId });
}

export async function getHouseById(id: string): Promise<SanityHouse | null> {
  return await sanityClient.fetch(HOUSE_BY_ID_QUERY, { id });
}

export async function getAllHouseIds(): Promise<string[]> {
  return await sanityClient.fetch(ALL_HOUSE_IDS_QUERY);
}

export async function getAllHouses(): Promise<SanityHouse[]> {
  return await sanityClient.fetch(ALL_HOUSES_QUERY);
}

export async function getAvailableHouses(): Promise<SanityHouse[]> {
  return await sanityClient.fetch(AVAILABLE_HOUSES_QUERY);
}

// Utility function to filter categories that have posts
export function getCategoriesWithPosts(
  categories: SanityCategory[],
  posts: SanityPost[],
): SanityCategory[] {
  return categories.filter((category) =>
    posts.some((post) =>
      post.categories?.some(
        (cat) => cat.slug.current === category.slug.current,
      ),
    ),
  );
}
