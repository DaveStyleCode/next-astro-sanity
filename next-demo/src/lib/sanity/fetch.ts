import { sanityFetch } from "./live";
import { client } from "./client";
import {
  POSTS_QUERY,
  POST_BY_SLUG_QUERY,
  ALL_POST_SLUGS_QUERY,
  AUTHORS_QUERY,
  CATEGORIES_QUERY,
  RELATED_POSTS_QUERY,
  STATES_QUERY,
  STATE_BY_NAME_QUERY,
  ALL_STATE_NAMES_QUERY,
  AREAS_QUERY,
  COMMUNITIES_BY_STATE_QUERY,
  COMMUNITY_BY_ID_QUERY,
  COMMUNITY_WITH_HOUSES_QUERY,
  STATE_WITH_COMMUNITIES_QUERY,
  ALL_COMMUNITY_IDS_QUERY,
  ALL_COMMUNITIES_QUERY,
  HOUSE_BY_ID_QUERY,
  ALL_HOUSE_IDS_QUERY,
  ALL_HOUSES_QUERY,
} from "./queries";
import type {
  SanityPost,
  SanityAuthor,
  SanityCategory,
  SanityState,
  SanityArea,
  SanityCommunity,
  SanityHouse,
} from "./types";

interface FetchOptions {
  stega?: boolean;
}

export async function getPosts(opts?: FetchOptions) {
  const { data } = await sanityFetch({ query: POSTS_QUERY, stega: opts?.stega });
  return data as SanityPost[];
}

export async function getPostBySlug(slug: string) {
  const { data } = await sanityFetch({ query: POST_BY_SLUG_QUERY, params: { slug } });
  return data as SanityPost | null;
}

export async function getAllPostSlugs() {
  return client.fetch<string[]>(ALL_POST_SLUGS_QUERY);
}

export async function getAuthors() {
  const { data } = await sanityFetch({ query: AUTHORS_QUERY, stega: false });
  return data as SanityAuthor[];
}

export async function getCategories(opts?: FetchOptions) {
  const { data } = await sanityFetch({ query: CATEGORIES_QUERY, stega: opts?.stega });
  return data as SanityCategory[];
}

export async function getRelatedPosts(postId: string, categoryIds: string[]) {
  if (categoryIds.length === 0) return [];
  const { data } = await sanityFetch({
    query: RELATED_POSTS_QUERY,
    params: { postId, categoryIds },
  });
  return data as SanityPost[];
}

export async function getStates() {
  const { data } = await sanityFetch({ query: STATES_QUERY });
  return data as SanityState[];
}

export async function getStateByName(name: string) {
  const { data } = await sanityFetch({ query: STATE_BY_NAME_QUERY, params: { name } });
  return data as SanityState | null;
}

export async function getAllStateNames() {
  return client.fetch<string[]>(ALL_STATE_NAMES_QUERY);
}

export async function getAreas() {
  const { data } = await sanityFetch({ query: AREAS_QUERY, stega: false });
  return data as SanityArea[];
}

export async function getCommunitiesByState(stateName: string) {
  const { data } = await sanityFetch({
    query: COMMUNITIES_BY_STATE_QUERY,
    params: { stateName },
  });
  return data as SanityCommunity[];
}

export async function getStateWithCommunities(name: string) {
  const { data } = await sanityFetch({
    query: STATE_WITH_COMMUNITIES_QUERY,
    params: { name },
  });
  return data as { state: SanityState | null; communities: SanityCommunity[] };
}

export async function getCommunityById(id: string) {
  const { data } = await sanityFetch({ query: COMMUNITY_BY_ID_QUERY, params: { id } });
  return data as SanityCommunity | null;
}

export async function getCommunityWithHouses(id: string) {
  const { data } = await sanityFetch({
    query: COMMUNITY_WITH_HOUSES_QUERY,
    params: { id },
  });
  return data as { community: SanityCommunity | null; houses: SanityHouse[] };
}

export async function getAllCommunityIds() {
  return client.fetch<string[]>(ALL_COMMUNITY_IDS_QUERY);
}

export async function getAllCommunities() {
  const { data } = await sanityFetch({ query: ALL_COMMUNITIES_QUERY, stega: false });
  return data as SanityCommunity[];
}

export async function getHouseById(id: string) {
  const { data } = await sanityFetch({ query: HOUSE_BY_ID_QUERY, params: { id } });
  return data as SanityHouse | null;
}

export async function getAllHouseIds() {
  return client.fetch<string[]>(ALL_HOUSE_IDS_QUERY);
}

export async function getAllHouses() {
  const { data } = await sanityFetch({ query: ALL_HOUSES_QUERY, stega: false });
  return data as SanityHouse[];
}

// Static-safe versions for generateStaticParams (no request scope needed)
export async function getPostsStatic() {
  return client.fetch<SanityPost[]>(POSTS_QUERY);
}

export async function getCategoriesStatic() {
  return client.fetch<SanityCategory[]>(CATEGORIES_QUERY);
}

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
