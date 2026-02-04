import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/PostCard";
import { getAllPosts, type ContentPost } from "@/lib/content";

interface Props { params: Promise<{ tag: string }> }

function getUniqueTags(posts: ContentPost[]): string[] {
  return [...new Set(posts.flatMap((p) => p.tags))].sort();
}

export async function generateStaticParams() {
  return getUniqueTags(getAllPosts()).map((tag) => ({ tag }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  return { title: `Posts tagged "${tag}"`, description: `All posts tagged with ${tag}` };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const allPosts = getAllPosts();
  const allTags = getUniqueTags(allPosts);
  if (!allTags.includes(tag)) notFound();

  const posts = allPosts.filter((p) => p.tags.includes(tag));

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8">
        <Link href="/blog" className="text-primary-600 hover:underline">&larr; Back to all posts</Link>
        <h1 className="mt-4 text-3xl font-bold">Posts tagged &quot;<span className="text-primary-600">{tag}</span>&quot;</h1>
        <p className="mt-2 text-secondary">{posts.length} {posts.length === 1 ? "post" : "posts"} found</p>
      </div>
      <div className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-secondary uppercase tracking-wide">Other Tags</h2>
        <div className="flex flex-wrap gap-2">
          {allTags.filter((t) => t !== tag).map((t) => (
            <Link key={t} href={`/tag/${t}`} className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-secondary hover:bg-primary-100 hover:text-primary-700 transition-colors">{t}</Link>
          ))}
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {posts.map((p) => <PostCard key={p.id} title={p.title} description={p.description} pubDate={p.pubDate} slug={p.id} tags={p.tags} body={p.body} />)}
      </div>
    </div>
  );
}
