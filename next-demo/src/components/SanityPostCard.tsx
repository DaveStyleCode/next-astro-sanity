import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { urlFor, hasImageAsset } from "@/lib/sanity/image";
import type { SanityPost } from "@/lib/sanity/types";

interface SanityPostCardProps {
  post: SanityPost;
}

export function SanityPostCard({ post }: SanityPostCardProps) {
  const { title, excerpt, publishedAt, slug, categories, mainImage } = post;

  return (
    <article className="group rounded-lg bg-white/5 p-6 transition-shadow hover:shadow-lg">
      <Link href={`/blog/${slug.current}`} className="block">
        {hasImageAsset(mainImage) && (
          <Image
            src={urlFor(mainImage).width(600).height(400).url()}
            alt={mainImage?.alt || title}
            className="mb-4 rounded-lg object-cover w-full h-48"
            width={600}
            height={400}
          />
        )}
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-secondary">
          {publishedAt && (
            <time dateTime={publishedAt}>
              {formatDate(new Date(publishedAt))}
            </time>
          )}
        </div>
        <h2 className="mb-2 text-xl font-semibold group-hover:text-primary-600 transition-colors">
          {title}
        </h2>
        {excerpt && (
          <p className="mb-4 text-secondary line-clamp-2">{excerpt}</p>
        )}
      </Link>
      {categories && categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link
              key={category._id}
              href={`/category/${category.slug.current}`}
              className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-secondary hover:bg-primary-100 hover:text-primary-700 transition-colors"
            >
              {category.title}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
