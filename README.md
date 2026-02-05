# Astro vs Next.js Comparison

A comprehensive comparison of building identical sites with **Astro** and **Next.js**, demonstrating the strengths and trade-offs of each framework for content-focused websites.

## Quick Start

### Environment files

Both projects require environment variables for Sanity CMS integration. Copy the sample files and fill in your values:

**Astro:**

```bash
cd astro-demo
cp .env-sample .env.local
```

Edit `.env.local` with your Sanity credentials:

```
PUBLIC_SANITY_PROJECT_ID=your-project-id
PUBLIC_SANITY_DATASET=production
PUBLIC_SANITY_VISUAL_EDITING_ENABLED=true
SANITY_API_TOKEN=your-api-token
```

**Next.js:**

```bash
cd next-demo
cp .env-sample .env.local
```

Edit `.env.local` with your Sanity credentials:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
SANITY_API_READ_TOKEN=your-api-token
```


### Astro

```bash
cd astro-demo
npm install
npm run dev    # Development server at http://localhost:4321
npm run build  # Build to dist/
```

### Next.js

```bash
cd next-demo
npm install
npm run dev    # Development server at http://localhost:3000
npm run build  # Build to .next/
```

## Features Comparison

Both implementations include identical features:

| Feature                     | Astro | Next.js |
| --------------------------- | ----- | ------- |
| Home page                   | ✅    | ✅      |
| Blog listing (paginated)    | ✅    | ✅      |
| Post detail (portable text) | ✅    | ✅      |
| Category pages              | ✅    | ✅      |
| Author pages                | ✅    | ✅      |
| About page                  | ✅    | ✅      |
| State listing & state pages | ✅    | ✅      |
| Community pages             | ✅    | ✅      |
| House (QMI) detail pages    | ✅    | ✅      |
| Dark/light mode             | ✅    | ✅      |
| Client-side search          | ✅    | ✅      |
| RSS feed                    | ✅    | ✅      |
| Sitemap                     | ✅    | ✅      |
| SEO meta tags               | ✅    | ✅      |
| Reading time                | ✅    | ✅      |
| Table of contents           | ✅    | ✅      |
| Tailwind CSS                | ✅    | ✅      |
| TypeScript                  | ✅    | ✅      |

## Sanity content model

The shared `studio/` uses the following schema types:

| Schema      | Purpose |
| ----------- | ------- |
| **post**    | Blog posts: title, slug, author ref, main image, categories, publishedAt, excerpt, portable text body (blocks + images). |
| **author**  | Blog authors: name, slug, image, bio. |
| **category**| Blog categories/tags: title, slug, description. |
| **state**   | US states: name, slug, coordinates (lat/lng). Used for location hierarchy. |
| **areas**   | Geographic areas/markets: name, title, url, state ref, location (lat/lng, radius, zoom), areaInfoContent, breadcrumb, RTE data. |
| **community** | Housing communities: name, image, state/area refs, address, page link, selling status, pricing (min/max, available homes, call for price), specs (beds, baths, cars, stories, sqft), brand, property type, amenities, coordinates, refs to houses and floor plans. |
| **house**   | Individual homes (QMIs): address, city, state, zip, image, community ref, floor plan ref, page link, price, status, move-in info, specs (beds, baths, sqft, stories, garage, lot), brand, features, photos. |
| **floorPlan** | Floor plans: name, image, slug, community ref, page link, specs (beds, baths, sqft, stories, garage), pricing (price/min/max), brand, features, description. |

Blog features in the table above are backed by **post**, **author**, and **category**. The **state**, **areas**, **community**, **house**, and **floorPlan** schemas support real-estate/community content (locations, communities, homes, and floor plans).

## Tech Stack

### Astro

- Astro 4.x with Content Collections
- Tailwind CSS 4.x
- MDX via @astrojs/mdx
- Shiki for syntax highlighting
- @astrojs/sitemap

### Next.js

- Next.js 14+ with App Router
- Tailwind CSS 4.x
- MDX via next-mdx-remote
- React Server Components
- Lucide React for icons

## Architecture Comparison

### Astro

- **Zero JS by default**: Pages ship as static HTML with no JavaScript
- **Islands Architecture**: Interactive components opt-in with `client:*` directives
- **Content Collections**: Built-in type-safe content management with schemas
- **Component Flexibility**: Use `.astro` files, React, Vue, Svelte, or any framework
- **Scoped Styles**: CSS is scoped to components by default

### Next.js

- **Server Components**: React components render on the server by default
- **Client Components**: Interactive components marked with `'use client'`
- **App Router**: File-based routing with nested layouts
- **Streaming**: Progressive page rendering with Suspense
- **Full React Ecosystem**: Access to all React libraries and patterns

## Key Implementation Differences

### Content Loading

**Astro** uses Content Collections with built-in loaders:

```typescript
// src/content.config.ts
const posts = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "../shared/content/posts" }),
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    // ...
  }),
})
```

**Next.js** uses custom content utilities:

```typescript
// src/lib/content.ts
export function getAllPosts(): Post[] {
  const files = fs.readdirSync(postsDirectory)
  // Parse frontmatter with gray-matter
  // ...
}
```

### Dark Mode

**Astro** uses inline script to prevent flash:

```astro
<script is:inline>
  const theme = localStorage.getItem('theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.classList.toggle('dark', theme === 'dark');
</script>
```

**Next.js** uses client component with useEffect:

```tsx
'use client';
useEffect(() => {
  const theme = localStorage.getItem('theme') || ...;
  document.documentElement.classList.toggle('dark', theme === 'dark');
}, []);
```

### MDX Rendering

**Astro** has built-in MDX support:

```astro
---
import { render } from 'astro:content';
const { Content } = await render(post);
---
<Content />
```

**Next.js** uses next-mdx-remote:

```tsx
import { compileMDX } from "next-mdx-remote/rsc"
const { content } = await compileMDX({ source, components })
```

## When to Choose Each

### Choose Astro When:

- Building content-heavy sites (blogs, docs, marketing)
- Performance is the top priority
- You want minimal JavaScript shipped to clients
- You need framework flexibility (mix React, Vue, etc.)
- SEO and Core Web Vitals are critical

### Choose Next.js When:

- Building full-stack applications
- You need rich interactivity throughout
- Your team is invested in the React ecosystem
- You need ISR (Incremental Static Regeneration)
- You want streaming and progressive rendering

## Sample Content

The shared content includes 6 blog posts covering:

1. Getting Started with Astro
2. Next.js App Router Deep Dive
3. Comparing Static Site Generators
4. Modern CSS Techniques
5. TypeScript Best Practices
6. Web Performance Optimization

Written by 2 authors: Jane Developer and Alex Coder.

## Running Performance Tests

### Build Size Comparison

```bash
# Astro
cd astro-demo && npm run build
du -sh dist/

# Next.js
cd next-demo && npm run build
du -sh .next/
```

### Lighthouse Audit

1. Build and serve each project
2. Run Lighthouse in Chrome DevTools
3. Compare Performance, Accessibility, Best Practices, SEO scores

## File Count Comparison

| Category        | Astro   | Next.js |
| --------------- | ------- | ------- |
| Config files    | 1       | 1       |
| Layout files    | 1       | 1       |
| Page files      | 9       | 10      |
| Component files | 6       | 7       |
| Utility files   | 2       | 3       |
| **Total**       | **~19** | **~22** |

## Conclusion

Both Astro and Next.js are excellent choices for building modern websites. Astro excels at content-focused sites with its zero-JS-by-default approach and Content Collections, while Next.js offers more flexibility for complex, interactive applications with its Server Components and full React integration.

For a blog like this demo, Astro provides a more streamlined developer experience with smaller bundle sizes. However, if your blog needs to evolve into a full application with user accounts, comments, or real-time features, Next.js offers a clearer path forward.
