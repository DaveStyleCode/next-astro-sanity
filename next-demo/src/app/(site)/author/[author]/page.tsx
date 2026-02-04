import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/PostCard";
import { AuthorCard } from "@/components/AuthorCard";
import { getAllAuthors, getAllPosts } from "@/lib/content";

interface Props { params: Promise<{ author: string }> }

export async function generateStaticParams() {
  return getAllAuthors().map((a) => ({ author: a.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { author: id } = await params;
  const author = getAllAuthors().find((a) => a.id === id);
  if (!author) return { title: "Author Not Found" };
  return { title: author.name, description: `Posts by ${author.name}` };
}

export default async function AuthorPage({ params }: Props) {
  const { author: id } = await params;
  const author = getAllAuthors().find((a) => a.id === id);
  if (!author) notFound();

  const posts = getAllPosts().filter((p) => p.author === id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8"><Link href="/blog" className="text-primary-600 hover:underline">&larr; Back to all posts</Link></div>
      <div className="mb-12"><AuthorCard {...author} /></div>
      <div>
        <h2 className="mb-6 text-2xl font-bold">Posts by {author.name}</h2>
        <p className="mb-6 text-secondary">{posts.length} {posts.length === 1 ? "post" : "posts"} published</p>
        {posts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {posts.map((p) => <PostCard key={p.id} title={p.title} description={p.description} pubDate={p.pubDate} slug={p.id} tags={p.tags} body={p.body} />)}
          </div>
        ) : <p className="text-secondary">No posts yet.</p>}
      </div>
    </div>
  );
}
