export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getUniqueTagsFromPosts(
  posts: { data: { tags: string[] } }[],
): string[] {
  const tags = posts.flatMap((post) => post.data.tags);
  return [...new Set(tags)].sort();
}

export function generateTableOfContents(
  content: string,
): { text: string; slug: string; level: number }[] {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  const toc: { text: string; slug: string; level: number }[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const slug = slugify(text);
    toc.push({ text, slug, level });
  }

  return toc;
}
