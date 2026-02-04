import type { Metadata } from "next";
import Link from "next/link";
import { SanityPostCard } from "@/components/SanityPostCard";
import { getPosts, getCategories, getCategoriesWithPosts } from "@/lib/sanity/fetch";

const POSTS_PER_PAGE = 6;

export const metadata: Metadata = {
  title: "Blog",
  description: "Read all our blog posts about web development, performance, and modern frontend techniques.",
};

export default async function BlogPage() {
  const [posts, allCategories] = await Promise.all([getPosts(), getCategories()]);
  const categories = getCategoriesWithPosts(allCategories, posts);
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const paginatedPosts = posts.slice(0, POSTS_PER_PAGE);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Blog</h1>
        <p className="mt-2 text-secondary">Thoughts on web development, frameworks, and building for the modern web.</p>
      </div>
      {categories.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-secondary uppercase tracking-wide">Browse by Category</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link key={category._id} href={`/category/${category.slug.current}`} className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-secondary hover:bg-primary-100 hover:text-primary-700 transition-colors">
                {category.title}
              </Link>
            ))}
          </div>
        </div>
      )}
      {posts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {paginatedPosts.map((post) => (<SanityPostCard key={post._id} post={post} />))}
        </div>
      ) : (
        <p className="text-secondary">No posts yet. Check back soon!</p>
      )}
      {totalPages > 1 && (
        <nav className="mt-8 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Link key={page} href={page === 1 ? "/blog" : `/blog/page/${page}`} className={`min-w-10 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-center ${page === 1 ? "bg-primary-500 text-white" : "border border-white/10 bg-white/5 hover:bg-white/10"}`}>
              {page}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
