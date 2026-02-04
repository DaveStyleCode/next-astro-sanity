import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { SanityPostCard } from "@/components/SanityPostCard"
import { getCategories, getPosts, getCategoriesWithPosts, getCategoriesStatic } from "@/lib/sanity/fetch"

interface Props {
  params: Promise<{ category: string }>
}

export async function generateStaticParams() {
  const categories = await getCategoriesStatic()
  return categories.map((cat) => ({ category: cat.slug.current }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params
  const categories = await getCategories()
  const cat = categories.find((c) => c.slug.current === slug)
  if (!cat) return { title: "Category Not Found" }
  return { title: cat.title, description: cat.description || `Posts in ${cat.title}` }
}

export default async function CategoryPage({ params }: Props) {
  const { category: slug } = await params
  const [allCategories, allPosts] = await Promise.all([getCategories(), getPosts()])
  const category = allCategories.find((c) => c.slug.current === slug)
  if (!category) notFound()

  const categoriesWithPosts = getCategoriesWithPosts(allCategories, allPosts)
  const posts = allPosts
    .filter((p) => p.categories?.some((c) => c.slug.current === slug))
    .sort((a, b) => {
      const da = a.publishedAt ? new Date(a.publishedAt).valueOf() : 0
      const db = b.publishedAt ? new Date(b.publishedAt).valueOf() : 0
      return db - da
    })

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8">
        <Link href="/blog" className="text-primary-600 hover:underline">
          &larr; Back to all posts
        </Link>
        <h1 className="mt-4 text-3xl font-bold">
          <span className="text-primary-600">{category.title}</span>
        </h1>
        {category.description && <p className="mt-2 text-secondary text-lg">{category.description}</p>}
        <p className="mt-2 text-secondary">
          {posts.length} {posts.length === 1 ? "post" : "posts"} found
        </p>
      </div>
      {categoriesWithPosts.length > 1 && (
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-secondary uppercase tracking-wide">Other Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categoriesWithPosts
              .filter((c) => c._id !== category._id)
              .map((c) => (
                <Link key={c._id} href={`/category/${c.slug.current}`} className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-secondary hover:bg-primary-100 hover:text-primary-700 transition-colors">
                  {c.title}
                </Link>
              ))}
          </div>
        </div>
      )}
      {posts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((p) => (
            <SanityPostCard key={p._id} post={p} />
          ))}
        </div>
      ) : (
        <p className="text-secondary">No posts in this category yet.</p>
      )}
    </div>
  )
}
