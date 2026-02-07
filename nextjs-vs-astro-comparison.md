# Next.js vs Astro: Framework Recommendation

> **Context:** Monorepo (`pnpm` + Turborepo) with Sanity CMS, React Native mobile app(s), page-builder architecture, and LaunchDarkly personalization.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Architecture Snapshot](#current-architecture-snapshot)
3. [Evaluation Criteria](#evaluation-criteria)
   - [Sanity CMS Integration](#1-sanity-cms-integration)
   - [React Native & Code Sharing](#2-react-native--code-sharing)
   - [Performance — SSG, SSR, & Hybrid Rendering](#3-performance--ssg-ssr--hybrid-rendering)
   - [Personalization with LaunchDarkly](#4-personalization-with-launchdarkly)
   - [Build Times](#5-build-times)
   - [Interactivity Model](#6-interactivity-model)
   - [Island / Route-Level A/B Testing](#7-island--route-level-ab-testing)
   - [Learning Curve](#8-learning-curve)
   - [Ecosystem & Community](#9-ecosystem--community)
   - [Future Migration Path](#10-future-migration-path)
4. [Weighted Scorecard](#weighted-scorecard)
5. [Recommendation](#recommendation)
6. [Appendix: Migration Escape Hatch](#appendix-migration-escape-hatch)

---

## Executive Summary

Both Next.js and Astro are capable frameworks, but they optimize for fundamentally different things. **Next.js optimizes for dynamic, app-like experiences** where React runs everywhere. **Astro optimizes for content-heavy sites** where most pages are static and interactivity is the exception, not the rule.

Given the requirements — Sanity-driven page builder, LaunchDarkly personalization with full-route A/B variants, a React Native mobile app sharing logic, and a team already invested in React — **Next.js is the stronger choice for the initial build**, with the understanding that an Astro migration remains a viable (and relatively mechanical) option down the road if the site's needs shift more toward pure content delivery.

---

## Current Architecture Snapshot

```
├── apps/
│   ├── website/            ← Next.js 15, React 18, Tailwind, @sanity/client
│   ├── mobile/             ← React Native (Expo), shares Sanity client
│   ├── experience-builder/ ← Sanity Studio (page builder + personalization schemas)
│   └── community-builder/  ← Sanity Studio (community data)
├── packages/
│   ├── community-schemas/  ← Shared Sanity schema types
│   └── config/             ← Shared tsconfig
├── turbo.json
└── pnpm-workspace.yaml
```

Key patterns already in place:

- **Page Builder** with 11 block types (`heroBlock`, `ctaBlock`, `communityCollectionBlock`, etc.)
- **Personalization schema** with audience segments and per-segment section variants
- **Block Renderer** — a single React component mapping `_type` to UI
- **Shared Sanity client** used across web and mobile

---

## Evaluation Criteria

### 1. Sanity CMS Integration

| | Next.js | Astro |
|---|---|---|
| **Official SDK** | First-class. `next-sanity` provides live preview, visual editing, `@sanity/image-url`, and App Router integration out of the box. | Good. `@sanity/astro` integration exists and supports visual editing, but the ecosystem is smaller and updates lag behind. |
| **Live Preview / Visual Editing** | Mature. Sanity's Presentation tool is purpose-built for Next.js with `useLiveQuery`, draft mode, and overlay support. | Supported via `@sanity/astro` but requires more manual wiring. Fewer examples in the wild. |
| **Portable Text** | `@portabletext/react` — same renderer already used in the codebase and in the mobile app. | `@portabletext/astro` exists but it's a different renderer. Custom serializers won't be shareable with mobile. |
| **Content Source Maps** | Full support for click-to-edit in Sanity Studio. | Supported, though the integration is newer. |

**Verdict: Next.js wins.** Sanity's tooling is built React-first and Next.js-first. The experience-builder studio already assumes React rendering.

---

### 2. React Native & Code Sharing

| | Next.js | Astro |
|---|---|---|
| **Shared components** | React components (like `BlockRenderer`) can be shared between web and mobile via the monorepo. Types, utilities, Sanity queries, and even some UI code can live in shared packages. | Astro components (`.astro` files) cannot be used in React Native. You'd need to maintain parallel React components for any shared logic, or use Astro's React island integration — which limits what you share. |
| **Shared types** | TypeScript types for blocks, pages, and Sanity responses are directly importable everywhere. | Same types work, but the rendering layer diverges. |
| **Future mobile apps** | If additional React Native apps are added to the monorepo, the web's React component library is ready to share. | Additional mobile apps would still need their own React component implementations. |

**Verdict: Next.js wins decisively.** A React-everywhere strategy means components, hooks, and rendering logic can flow between web and mobile. With Astro, the web becomes an island unto itself.

---

### 3. Performance — SSG, SSR, & Hybrid Rendering

| | Next.js | Astro |
|---|---|---|
| **Static Generation (SSG)** | Fully supported. `generateStaticParams` + ISR gives you static pages that revalidate on a timer or on-demand via Sanity webhooks. | Native strength. Astro was born for this. Static output is its default mode and produces the smallest possible HTML. |
| **Server-Side Rendering (SSR)** | Mature. Streaming SSR, React Server Components, and the App Router give fine-grained control over what renders where. | Supported (via `output: 'server'` or `output: 'hybrid'`). Works well but is less battle-tested at scale for dynamic content. |
| **Hybrid rendering** | Per-route via `export const dynamic = 'force-static'` or `'force-dynamic'`. Very granular. | Per-route via `export const prerender = true/false`. Equally granular. |
| **JS payload (static pages)** | Ships the React runtime (~80-100 KB gzipped) even for mostly static pages. Partial Prerendering (PPR) in Next.js 15 mitigates this by streaming static shells. | Ships zero JS by default. Only islands that need interactivity get hydrated. A content-heavy page can be ~0 KB JS. |
| **Core Web Vitals** | Good with effort. Requires attention to bundle size, font loading, image optimization (`next/image`), and avoiding hydration jank. | Excellent out of the box for content pages. Near-perfect Lighthouse scores are the norm for static Astro sites. |

**Verdict: Astro wins on raw static performance.** For a content-heavy site, the zero-JS default is compelling. However, Next.js 15's Partial Prerendering narrows this gap significantly, and the personalization requirements (see below) mean many pages won't be purely static anyway.

---

### 4. Personalization with LaunchDarkly

This is one of the most consequential factors.

| | Next.js | Astro |
|---|---|---|
| **Server-side flags** | LaunchDarkly's Node SDK works natively in Route Handlers, Server Components, and Middleware. You can resolve flags at the edge before the page renders. | LaunchDarkly's Node SDK works in Astro's SSR endpoints and middleware. Functionally equivalent for server-side resolution. |
| **Client-side flags** | `launchdarkly-react-client-sdk` provides `useLDClient` hooks. React context propagates flags through the component tree naturally. | The React SDK works inside React islands, but flag context doesn't propagate across `.astro` component boundaries. You'd need to thread flags through props or use a shared store. |
| **Middleware-based targeting** | Next.js Middleware can read cookies/headers, evaluate flags, and rewrite to variant routes before any rendering happens. This is the cleanest pattern for full-route A/B tests. | Astro middleware can do the same thing. Functionally equivalent. |
| **Edge evaluation** | Next.js Middleware runs on the edge (Vercel, Cloudflare). LD's edge SDK integrates cleanly. | Astro can deploy to edge runtimes (Cloudflare, Deno) and evaluate flags there. |
| **Streaming + personalization** | React Server Components can resolve flags server-side and stream personalized content. No layout shift. | Astro SSR can do this, but you lose the zero-JS benefit the moment you need client-side reactivity for personalized experiences. |

**Verdict: Next.js has the edge.** Both frameworks can evaluate flags server-side, but Next.js's React-native flag propagation and server component streaming make personalized pages more natural to build. In Astro, the moment you need personalization that touches interactivity, you're writing React islands anyway — at which point you're paying the React tax without the React benefits.

---

### 5. Build Times

| | Next.js | Astro |
|---|---|---|
| **Cold build** | Moderate. The React compilation step and Webpack/Turbopack bundling add overhead. A 1,000-page site might take 2-5 minutes. | Fast. Astro's Vite-based build is lean. Same 1,000-page site might build in 30-90 seconds. |
| **Incremental builds (ISR)** | Next.js ISR means you don't rebuild the whole site. Pages revalidate individually on a timer or via webhook. Build time becomes nearly irrelevant for content updates. | Astro doesn't have a native ISR equivalent. You'd need to do full rebuilds or use an adapter-specific caching strategy. |
| **Dev server startup** | Fast with Turbopack (`next dev --turbopack`, already configured in this repo). Hot reload is near-instant. | Very fast. Vite's dev server is excellent. |
| **Monorepo build orchestration** | Turborepo caches builds across the monorepo. Next.js integrates well since `turbo.json` already tracks `.next/**` outputs. | Turborepo works equally well with Astro's `dist/**` output. |

**Verdict: Astro wins on cold build speed, but Next.js ISR makes it irrelevant for content updates.** For a CMS-driven site where content editors publish frequently, ISR's ability to update individual pages without a full rebuild is a significant operational advantage.

---

### 6. Interactivity Model

| | Next.js | Astro |
|---|---|---|
| **Default** | Everything is React. Client Components hydrate on the client; Server Components render on the server. You choose per-component. | Everything is static HTML. You opt into interactivity per-component via `client:*` directives (islands). |
| **Interactive features needed** | Mortgage calculators, community search/filter, map integrations, form wizards, image galleries, tab navigation — a home listing site has significant interactivity. | Each of these would be a React island. The plumbing for each island is manageable but adds architectural overhead. |
| **State sharing** | React context, Zustand, or any state library works across the whole page. | State doesn't naturally flow between islands. You'd use `nanostores`, custom events, or URL state. |
| **Forms** | React Hook Form, server actions, or any React form library. Progressive enhancement with `useFormStatus`. | Forms in `.astro` files work with standard HTML. Interactive forms need a React island. |

**Verdict: Next.js wins for this use case.** A home listing site is not a blog. Community search, mortgage tools, interactive maps, and personalized experiences mean a meaningful portion of pages need interactivity. Astro's island model works, but you'd be writing React components inside Astro islands — adding a layer of indirection without clear benefit.

---

### 7. Island / Route-Level A/B Testing

The personalization schema already defines **full variant routes** — different `sections` arrays per audience segment. This is the hardest personalization pattern to implement well.

| | Next.js | Astro |
|---|---|---|
| **Full-route variants** | Middleware rewrites to `/page?variant=B` → same route renders different content based on server-side flag resolution. The page is a single React tree; swapping sections is trivial. | Middleware rewrites work the same way. The page renders different content server-side. Functionally equivalent for SSR routes. |
| **Section-level variants** | The `BlockRenderer` already handles this. Pass different `sections[]` arrays based on the resolved variant. One component, one render path. | You'd need a similar block renderer — likely a React island wrapping the variant logic, or an Astro component that conditionally renders different islands. More complex. |
| **Client-side variant switching** | If a variant needs to change without a full page reload (e.g., the user's segment updates mid-session), React re-renders the component tree. Seamless. | Requires a full page navigation or a client-side React island that manages its own state. The Astro page shell won't re-render. |
| **Analytics & tracking** | LaunchDarkly + React means you can fire impression events from the same component tree that renders the variant. | Tracking works but needs coordination between the Astro page and the React islands. |

**Verdict: Next.js wins.** The existing personalization schema is designed around full-section variant swapping. In React, this is just passing a different array to `BlockRenderer`. In Astro, you'd need to either do all variant logic server-side (losing client-side reactivity) or wrap large portions of the page in React islands (negating Astro's benefits).

---

### 8. Learning Curve

| | Next.js | Astro |
|---|---|---|
| **For this team** | The codebase is already Next.js. The team knows React. The mobile app is React Native. There is zero ramp-up. | Astro's `.astro` file format, island directives (`client:load`, `client:visible`, etc.), and content collections are new concepts. Moderate ramp-up. |
| **General complexity** | Next.js 15 with App Router, Server Components, and server actions has a steeper learning curve than Next.js historically. But the team is already here. | Astro is simpler in isolation — the mental model of "HTML + islands" is clean. But integrating it with Sanity, LaunchDarkly, and React Native sharing adds back complexity. |
| **Hiring** | React/Next.js is the most common frontend stack. Large talent pool. | Astro is growing but has a much smaller talent pool. Hiring is harder. |

**Verdict: Next.js wins.** The team is already productive. Switching frameworks has a real cost measured in weeks, not days — and the new concepts would need to be learned alongside the existing Sanity/LaunchDarkly integrations.

---

### 9. Ecosystem & Community

| | Next.js | Astro |
|---|---|---|
| **NPM downloads** | ~7M/week | ~400K/week |
| **GitHub stars** | ~130K | ~50K |
| **Vercel integration** | First-party. Optimized deployment, analytics, edge functions, image optimization. | Excellent Vercel adapter, but not first-party. Also deploys well to Cloudflare, Netlify, and Deno. |
| **Third-party integrations** | Nearly every SaaS (analytics, A/B testing, CMS, auth) has a Next.js example or SDK. | Growing fast but gaps exist. LaunchDarkly doesn't have an official Astro integration. |
| **Enterprise adoption** | Proven at enterprise scale (Nike, Hulu, TikTok, Notion). | Growing in the content/marketing site space. Fewer enterprise references for dynamic/personalized sites. |

**Verdict: Next.js wins.** The ecosystem depth matters when integrating multiple third-party services.

---

### 10. Future Migration Path

This is a crucial consideration. **Starting with Next.js does not lock you out of Astro.**

| Migration aspect | Effort |
|---|---|
| **Sanity queries & client** | Reusable as-is. `@sanity/client` works in both frameworks. |
| **React components** | Drop directly into Astro as React islands. The `BlockRenderer` and all block components would work inside `client:load` or `client:visible` directives. |
| **TypeScript types** | Fully portable. |
| **Tailwind styles** | Fully portable. |
| **Sanity schemas** | Unchanged. The CMS layer is framework-agnostic. |
| **LaunchDarkly logic** | Server-side flag evaluation would move to Astro middleware/endpoints. Client-side React SDK would work inside islands. |
| **Routing** | Would need to be rewritten from Next.js App Router conventions to Astro's file-based routing. Moderate effort. |
| **Middleware** | Similar concepts exist in both. Would need rewriting but the logic ports cleanly. |

**Key insight:** The migration from Next.js → Astro is largely mechanical for a Sanity-driven site. The content layer (Sanity), the component layer (React), and the styling layer (Tailwind) are all portable. What changes is the routing/rendering framework — and that's a one-time effort.

The reverse migration (Astro → Next.js) would be similarly possible, but `.astro` components would need to be rewritten as React components — which is more work than the other direction.

---

## Weighted Scorecard

| Criterion | Weight | Next.js | Astro | Notes |
|---|---|---|---|---|
| Sanity CMS Integration | 15% | 9/10 | 7/10 | Sanity's tooling is React/Next-first |
| React Native Code Sharing | 15% | 10/10 | 4/10 | React-everywhere vs. parallel implementations |
| Performance (SSG/SSR) | 10% | 7/10 | 9/10 | Astro's zero-JS default is hard to beat |
| LaunchDarkly Personalization | 15% | 9/10 | 6/10 | Server-side is equal; client-side React is superior |
| Build Times | 5% | 7/10 | 9/10 | ISR offsets Astro's faster cold builds |
| Interactivity | 10% | 9/10 | 6/10 | Home listing site needs significant interactivity |
| Route-Level A/B Testing | 15% | 9/10 | 6/10 | Existing schema assumes React rendering model |
| Learning Curve | 5% | 9/10 | 6/10 | Team is already in Next.js |
| Ecosystem & Community | 5% | 9/10 | 7/10 | Enterprise depth, hiring, third-party SDKs |
| Future Migration Path | 5% | 8/10 | 7/10 | Next → Astro is easier than Astro → Next |

### Weighted Scores

- **Next.js: 8.75 / 10**
- **Astro: 6.30 / 10**

---

## Recommendation

**Use Next.js for the initial build.**

The decision is driven by three reinforcing factors:

1. **Personalization is a first-class requirement, not an afterthought.** LaunchDarkly-driven full-route A/B testing with per-segment variants means most high-value pages are dynamic. Astro's strength (zero JS, static by default) is precisely the thing you'd be opting out of on personalized pages.

2. **React Native code sharing is a force multiplier.** The monorepo already has a mobile app, with the possibility of more. A React-everywhere strategy means types, queries, components, and rendering logic are shared assets. With Astro, the web becomes a silo.

3. **The existing architecture assumes React.** The `BlockRenderer`, the personalization schema, the Sanity Portable Text renderer — everything is React. Astro would introduce a second rendering paradigm without eliminating the first (since the interactive parts would be React islands anyway).

### When Astro Would Be the Better Choice

Astro would be the right call if:

- The site were primarily content/marketing pages with minimal interactivity
- There were no React Native apps to share code with
- Personalization were limited to server-side-only (no client-side variant switching)
- Build performance for thousands of static pages were the primary bottleneck
- The team wanted to minimize client-side JavaScript at all costs

### The Escape Hatch

If performance profiling down the road reveals that Next.js's JavaScript payload is hurting Core Web Vitals on content-heavy pages (community listings, blog posts, static marketing pages), an incremental migration path exists:

1. **Phase 1:** Extract content-heavy routes into an Astro sub-app within the monorepo (`apps/marketing/`).
2. **Phase 2:** Use the existing React components as Astro islands with `client:visible` for lazy hydration.
3. **Phase 3:** Rewrite high-traffic static pages as pure `.astro` components if the React overhead is measurable.

This phased approach lets you start fast with Next.js today while keeping the door open for Astro where it makes the most sense — all without a big-bang rewrite.

---

## Appendix: Migration Escape Hatch

### What a Next.js → Astro migration looks like in this monorepo

```
├── apps/
│   ├── website/          ← Keep as Next.js for dynamic/personalized routes
│   ├── marketing/        ← NEW: Astro for static content pages
│   ├── mobile/           ← Unchanged
│   ├── experience-builder/
│   └── community-builder/
├── packages/
│   ├── ui/               ← NEW: Extract shared React components here
│   ├── sanity-queries/   ← NEW: Extract shared queries & types
│   ├── community-schemas/
│   └── config/
```

### Reusable across both frameworks

| Asset | Reusability |
|---|---|
| `@sanity/client` setup | Direct import |
| GROQ queries | Direct import |
| TypeScript types (blocks, pages) | Direct import |
| React components (BlockRenderer, etc.) | Use as Astro React islands |
| Tailwind config & styles | Copy or share via package |
| Sanity schemas | Completely framework-agnostic |
| LaunchDarkly server-side logic | Port to Astro middleware |

### What must be rewritten

| Asset | Effort |
|---|---|
| File-based routing (`app/` → `src/pages/`) | Moderate — structural, not logical |
| `next/image` → Astro `<Image>` or `<Picture>` | Low — API is similar |
| Middleware (Next.js → Astro) | Low-moderate — concepts map cleanly |
| `next/font` → Astro font loading | Low |
| Server actions → Astro API routes | Moderate |
| ISR/revalidation → rebuild triggers or adapter caching | Moderate |

**Bottom line:** The migration cost is real but bounded. It's a weeks-long effort, not a months-long one, because the hard parts (content modeling, component design, Sanity integration) are already framework-agnostic.
