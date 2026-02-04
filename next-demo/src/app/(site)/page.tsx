import Link from "next/link"
import { Zap, LayoutDashboard, ShieldCheck } from "lucide-react"
import { COMPANY_NAME } from "@/constants"
import { PostCard } from "@/components/PostCard"
import { getAllPosts } from "@/lib/content"

export default function Home() {
  const posts = getAllPosts()
  const recentPosts = posts.slice(0, 3)

  return (
    <>
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h1 className="text-4xl font-bold md:text-5xl lg:text-7xl">{COMPANY_NAME}</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-secondary">A modern, fast, and beautiful site built with Next.js and Sanity CMS. Exploring web development, performance optimization, and the latest in frontend technology.</p>
          {/* <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/blog" className="rounded-full bg-primary-800 px-6 py-3 font-medium text-white hover:bg-primary-700 transition-colors">
              Search Listings
            </Link>
          </div> */}
        </div>
      </section>

      {/* <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Recent Posts</h2>
            <Link href="/blog" className="hover:underline">
              View all posts →
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentPosts.map((post) => (
              <PostCard key={post.id} title={post.title} description={post.description} pubDate={post.pubDate} slug={post.id} tags={post.tags} body={post.body} />
            ))}
          </div>
        </div>
      </section> */}

      {/* <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-4xl font-bold">Why {COMPANY_NAME}?</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                <Zap className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="mb-2 text-2xl font-semibold">Lightning Fast</h3>
              <p className="text-sm text-white/60">Zero JavaScript by default means your pages load instantly.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                <LayoutDashboard className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="mb-2 text-2xl font-semibold">Content Focused</h3>
              <p className="text-sm text-white/60">Built for blogs, docs, and marketing sites that prioritize content.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                <ShieldCheck className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="mb-2 text-2xl font-semibold">SEO Optimized</h3>
              <p className="text-sm text-white/60">Static HTML means better SEO and faster indexing by search engines.</p>
            </div>
          </div>
        </div>
      </section> */}
    </>
  )
}
