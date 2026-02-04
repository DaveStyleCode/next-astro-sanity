import Link from "next/link";
import { formatDate, calculateReadingTime } from "@/lib/utils";

interface PostCardProps {
  title: string;
  description: string;
  pubDate: Date;
  slug: string;
  tags: string[];
  body?: string;
}

export function PostCard({ title, description, pubDate, slug, tags, body }: PostCardProps) {
  const readingTime = body ? calculateReadingTime(body) : null;

  return (
    <article className="group rounded-lg bg-white/5 p-6 transition-shadow hover:shadow-lg">
      <Link href={`/blog/${slug}`} className="block">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-secondary">
          <time dateTime={pubDate.toISOString()}>{formatDate(pubDate)}</time>
          {readingTime && (
            <>
              <span>&bull;</span>
              <span>{readingTime} min read</span>
            </>
          )}
        </div>
        <h2 className="mb-2 text-xl font-semibold group-hover:text-primary-600 transition-colors">
          {title}
        </h2>
        <p className="mb-4 text-secondary line-clamp-2">{description}</p>
      </Link>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link
            key={tag}
            href={`/tag/${tag}`}
            className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-secondary hover:bg-primary-100 hover:text-primary-700 transition-colors"
          >
            {tag}
          </Link>
        ))}
      </div>
    </article>
  );
}
