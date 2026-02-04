import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SanityPostCard } from "@/components/SanityPostCard";
import { getPosts, getPostsStatic } from "@/lib/sanity/fetch";

const POSTS_PER_PAGE = 6;

interface Props {
  params: Promise<{ page: string }>;
}

export async function generateStaticParams() {
  const posts = await getPostsStatic();
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  return Array.from({ length: totalPages }, (_, i) => ({ page: String(i + 1) })).filter((p) => p.page !== "1");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page } = await params;
  return { title: `Blog - Page ${page}` };
}

export default async function BlogPaginatedPage({ params }: Props) {
  const { page: pageStr } = await params;
  const page = parseInt(pageStr, 10);
  if (isNaN(page) || page < 1) notFound();

  const posts = await getPosts();
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  if (page > totalPages) notFound();

  const startIndex = (page - 1) * POSTS_PER_PAGE;
  const paginatedPosts = posts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Blog</h1>
        <p className="mt-2 text-secondary">Page {page} of {totalPages}</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {paginatedPosts.map((post) => (<SanityPostCard key={post._id} post={post} />))}
      </div>
      <nav className="mt-8 flex justify-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <Link key={p} href={p === 1 ? "/blog" : `/blog/page/${p}`} className={`min-w-10 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-center ${p === page ? "bg-primary-500 text-white" : "border border-white/10 bg-white/5 hover:bg-white/10"}`}>
            {p}
          </Link>
        ))}
      </nav>
    </div>
  );
}
