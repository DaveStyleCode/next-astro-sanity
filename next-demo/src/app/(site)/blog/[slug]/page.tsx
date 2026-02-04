import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { SanityContent } from "@/components/SanityContent"
import { SanityPostCard } from "@/components/SanityPostCard"
import { formatDate } from "@/lib/utils"
import { urlFor, hasImageAsset } from "@/lib/sanity/image"
import { getPostBySlug, getAllPostSlugs, getRelatedPosts } from "@/lib/sanity/fetch"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return { title: "Post Not Found" }
  return { title: post.title, description: post.excerpt }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const categoryIds = post.categories?.map((c) => c._id) || []
  const relatedPosts = await getRelatedPosts(post._id, categoryIds)

  return (
    <article className="mx-auto max-w-5xl px-4 py-12">
      <header className="mb-8">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-secondary">{post.publishedAt && <time dateTime={post.publishedAt}>{formatDate(new Date(post.publishedAt))}</time>}</div>
        <h1 className="text-3xl font-bold md:text-4xl lg:text-5xl">{post.title}</h1>
        {post.excerpt && <p className="mt-4 text-lg text-secondary">{post.excerpt}</p>}
        {post.categories && post.categories.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {post.categories.map((category) => (
              <Link key={category._id} href={`/category/${category.slug.current}`} className="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary hover:bg-primary-100 hover:text-primary-700 transition-colors">
                {category.title}
              </Link>
            ))}
          </div>
        )}
        {post.author && (
          <div className="mt-6 flex items-center gap-4">
            {hasImageAsset(post.author.image) && <Image src={urlFor(post.author.image).width(48).height(48).url()} alt={`Profile picture of ${post.author.name}`} className="w-12 h-12 rounded-full object-cover" width={48} height={48} />}
            <Link href={`/author/${post.author.slug.current}`} className="flex flex-col gap-1">
              <span className="font-medium hover:text-primary-600 transition-colors">{post.author.name}</span>
              {post.author.bio && <span className="text-sm text-secondary line-clamp-1">{post.author.bio}</span>}
            </Link>
          </div>
        )}
      </header>

      {hasImageAsset(post.mainImage) && (
        <div className="mb-8">
          <Image src={urlFor(post.mainImage).width(1200).height(630).url()} alt={post.mainImage?.alt || post.title} className="w-full rounded-lg object-cover" width={1200} height={630} />
        </div>
      )}

      {post.body && (
        <div className="min-w-0 flex-1">
          <SanityContent value={post.body} removeFirstHeading={true} />
        </div>
      )}

      {post.author && (
        <div className="mt-12 border-t pt-8 border-white/20">
          <h2 className="mb-4 text-lg font-semibold">Written by</h2>
          <div className="flex items-start gap-4">
            {hasImageAsset(post.author.image) && <Image src={urlFor(post.author.image).width(80).height(80).url()} alt={`Profile picture of ${post.author.name}`} className="w-20 h-20 rounded-full object-cover" width={80} height={80} />}
            <div>
              <p className="font-semibold text-lg">{post.author.name}</p>
              {post.author.bio && <p className="mt-1 text-secondary">{post.author.bio}</p>}
            </div>
          </div>
        </div>
      )}

      {relatedPosts.length > 0 && (
        <div className="mt-12 border-t pt-8">
          <h2 className="mb-6 text-lg font-semibold">Related Posts</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {relatedPosts.map((rp) => (
              <SanityPostCard key={rp._id} post={rp} />
            ))}
          </div>
        </div>
      )}
    </article>
  )
}
