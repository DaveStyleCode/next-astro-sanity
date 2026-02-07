# Next.js vs Astro: Framework Recommendation

> **Versions evaluated:** Next.js 16 (stable 16.1), Astro 5 (stable)
> **Context:** Evaluating frameworks for a house listing website within a [monorepo](https://github.com/DaveStyleCode/horton-monorepo) (`pnpm` + Turborepo) that includes Sanity CMS, React Native mobile app(s), page-builder architecture, and LaunchDarkly personalization. Hosting will be on **Vercel**. A Next.js proof-of-concept exists but no production framework decision has been made.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Proof-of-Concept Architecture](#proof-of-concept-architecture)
3. [Evaluation Criteria](#evaluation-criteria)
   - [Sanity CMS Integration](#1-sanity-cms-integration)
   - [React Native & Code Sharing](#2-react-native--code-sharing)
   - [Performance — SSG, SSR, & Hybrid Rendering](#3-performance--ssg-ssr--hybrid-rendering)
   - [Personalization with LaunchDarkly](#4-personalization-with-launchdarkly)
   - [Build Times](#5-build-times)
   - [Interactivity Model](#6-interactivity-model)
   - [A/B Testing — Full-Page & Element-Level](#7-ab-testing--full-page--element-level)
   - [Image Optimization](#8-image-optimization)
   - [SEO & Metadata](#9-seo--metadata)
   - [Content Editor Preview Workflow](#10-content-editor-preview-workflow)
   - [Hosting & Vendor Lock-In](#11-hosting--vendor-lock-in)
   - [SSR Infrastructure Cost](#12-ssr-infrastructure-cost)
   - [Learning Curve & Hiring](#13-learning-curve--hiring)
   - [Ecosystem & Community](#14-ecosystem--community)
   - [Internationalization](#15-internationalization)
   - [Future Migration Path](#16-future-migration-path)
4. [Weighted Scorecard](#weighted-scorecard)
5. [Recommendation](#recommendation)
6. [Appendix: Migration Escape Hatch](#appendix-migration-escape-hatch)

---

## Executive Summary

Both Next.js and Astro are capable frameworks, but they optimize for fundamentally different things. **Next.js optimizes for dynamic, app-like experiences** where React runs everywhere. **Astro optimizes for content-driven sites** where most pages are static and interactivity is the exception, not the rule.

Given the project requirements — Sanity-driven page builder, LaunchDarkly personalization with full-route A/B variants, React Native mobile app(s) sharing logic, Vercel hosting, and the practical realities of hiring and ecosystem maturity — **Next.js is the stronger choice**, with the understanding that an Astro migration remains a viable (and relatively mechanical) option down the road if the site's needs shift more toward pure content delivery.

---

## Proof-of-Concept Architecture

A Next.js POC has been built to validate the monorepo structure and Sanity integration patterns. **This POC does not represent a framework commitment** — it was chosen for speed of prototyping, and both Next.js and Astro are viable production choices. The [POC structure](https://github.com/DaveStyleCode/horton-monorepo):

```
monorepo/
├── apps/
│   ├── website/            ← POC: Next.js (React 18, Tailwind, @sanity/client)
│   ├── mobile/             ← React Native (Expo), shares Sanity client
│   ├── experience-builder/ ← Sanity Studio (page builder + personalization schemas)
│   └── community-builder/  ← Sanity Studio (community/listing data)
├── packages/
│   ├── community-schemas/  ← Shared Sanity schema types
│   └── config/             ← Shared tsconfig
├── turbo.json
└── pnpm-workspace.yaml
```

Key patterns validated in the POC:

- **Page Builder** with 11 block types (`heroBlock`, `ctaBlock`, `communityCollectionBlock`, etc.)
- **Personalization schema** with audience segments and per-segment section variants
- **Block Renderer** — a React component mapping `_type` to UI (would need an Astro equivalent or be used as an island in Astro)
- **Shared Sanity client** used across web and mobile

---

## Evaluation Criteria

### 1. Sanity CMS Integration

|                                      | Next.js                                                                                                                                             | Astro                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Official SDK**                     | First-class. `next-sanity` provides live preview, visual editing, `@sanity/image-url`, and App Router integration out of the box.                   | Good. `@sanity/astro` integration exists and supports visual editing, but the ecosystem is smaller and updates lag behind.                                                                                                                                                                                                                                                                                                                                                             |
| **Live Preview / Visual Editing**    | Mature. Sanity's Presentation tool is purpose-built for Next.js with `useLiveQuery`, draft mode, and overlay support.                               | Supported via `@sanity/astro` but requires more manual wiring. Fewer examples in the wild.                                                                                                                                                                                                                                                                                                                                                                                             |
| **Portable Text**                    | `@portabletext/react` — same renderer used in the mobile app, shareable across web and native.                                                      | `@portabletext/astro` exists but it's a different renderer. Custom serializers won't be shareable with mobile.                                                                                                                                                                                                                                                                                                                                                                         |
| **Content Source Maps**              | Full support for click-to-edit in Sanity Studio.                                                                                                    | Supported, though the integration is newer.                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **Content Collections (Astro-only)** | No equivalent. Next.js fetches data via `@sanity/client` directly in Server Components or `getStaticProps`. No framework-level content abstraction. | Astro's [Content Layer API](https://docs.astro.build/en/guides/content-collections/) allows defining a custom Sanity loader that pulls content into typed collections at build time. Collections get Zod schema validation, auto-generated TypeScript types, `getCollection()` / `getEntry()` helpers, and data caching between builds. This is a framework-level abstraction over CMS data that Next.js doesn't offer — though it adds a layer of indirection on top of GROQ queries. |

**Verdict: Next.js wins on live/preview tooling, but the gap is narrower than it appears.** Sanity's first-party tooling is built React-first and Next.js-first — live preview, visual editing overlays, and draft mode are more polished. However, Astro's Content Collections provide a framework-level data abstraction (typed collections with Zod validation and build caching) that Next.js lacks entirely. For a heavily CMS-driven site, Content Collections are a genuine differentiator for Astro's developer experience at the data layer, even if Sanity's UI tooling favors Next.js.

---

### 2. React Native & Code Sharing

|                        | Next.js                                                                                                                                                      | Astro                                                                                                                                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Shared components**  | React components can be shared between web and mobile via the monorepo. Types, utilities, Sanity queries, and even some UI code can live in shared packages. | Astro components (`.astro` files) cannot be used in React Native. You'd need to maintain parallel React components for any shared logic, or use Astro's React island integration — which limits what you share. |
| **Shared types**       | TypeScript types for blocks, pages, and Sanity responses are directly importable everywhere.                                                                 | Same types work, but the rendering layer diverges.                                                                                                                                                              |
| **Future mobile apps** | If additional React Native apps are added to the monorepo, the web's React component library is ready to share.                                              | Additional mobile apps would still need their own React component implementations.                                                                                                                              |

**Verdict: Next.js wins decisively for the shared data/logic layer — but temper expectations on shared UI.** A React-everywhere strategy means types, queries, hooks, validation logic, and Sanity client configuration flow freely between web and mobile. However, UI component sharing between React DOM and React Native is limited in practice — mobile and web have fundamentally different layout paradigms (Flexbox-only vs. CSS Grid, `<View>` vs. `<div>`, platform-specific navigation). The real win is the shared _data and business logic_ layer (Sanity queries, TypeScript types, form validation, flag evaluation), which works equally well in both frameworks since it's just TypeScript. The incremental advantage for Next.js is that interactive UI components written in React for the web can at least _inform_ their React Native counterparts (shared patterns, shared hooks), whereas `.astro` components have zero transferability to mobile.

---

### 3. Performance — SSG, SSR, & Hybrid Rendering

|                                 | Next.js                                                                                                                                                                                                                                                                    | Astro                                                                                                                        |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Static Generation (SSG)**     | Fully supported. `generateStaticParams` + ISR gives you static pages that revalidate on a timer or on-demand via Sanity webhooks.                                                                                                                                          | Native strength. Astro was born for this. Static output is its default mode and produces the smallest possible HTML.         |
| **Server-Side Rendering (SSR)** | Mature. Streaming SSR, React Server Components, Cache Components (`use cache`), and the App Router give fine-grained control over what renders where and when. Next.js 16 adds Node.js middleware (no longer edge-only) and the React Compiler for automatic optimization. | Supported (via `output: 'server'` or `output: 'hybrid'`). Works well but is less battle-tested at scale for dynamic content. |
| **Hybrid rendering**            | Per-route via `export const dynamic = 'force-static'` or `'force-dynamic'`. Very granular.                                                                                                                                                                                 | Per-route via `export const prerender = true/false`. Equally granular.                                                       |
| **JS payload (static pages)**   | Ships the React runtime (~80-100 KB gzipped — verify against React 19's actual bundle size, which may have shifted) even for mostly static pages. Next.js 16's Cache Components (`use cache`) mitigate this by pre-rendering static shells and streaming dynamic holes.    | Ships zero JS by default. Only islands that need interactivity get hydrated. A content-heavy page can be ~0 KB JS.           |
| **Core Web Vitals**             | Good with effort. Requires attention to bundle size, font loading, image optimization (`next/image`), and avoiding hydration jank.                                                                                                                                         | Excellent out of the box for content pages. Near-perfect Lighthouse scores are the norm for static Astro sites.              |

**Verdict: Astro wins on raw static performance.** For a content-heavy house listing site, the zero-JS default is compelling. However, Next.js 16's Cache Components (`use cache` directive) narrow this gap by allowing per-component caching decisions — a static shell can be cached while dynamic/personalized holes stream in. The personalization requirements (see below) mean many pages won't be purely static anyway.

---

### 4. Personalization with LaunchDarkly

This is one of the most consequential factors.

|                                 | Next.js                                                                                                                                                                                                                                                                                              | Astro                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Server-side flags**           | LaunchDarkly's Node SDK works natively in Route Handlers, Server Components, and Middleware. Since Next.js 16 (stable since 15.5), Middleware supports the full Node.js runtime — no longer restricted to the Edge runtime — so the full LD Node SDK works directly in middleware without polyfills. | LaunchDarkly's Node SDK works in Astro's SSR endpoints and middleware `onRequest()` handler. Resolved flags can be stored in `context.locals` and are then accessible in every `.astro` page and API endpoint for that request — no prop drilling needed. Functionally equivalent for server-side resolution.                                                                                                                                                                           |
| **Client-side flags**           | `launchdarkly-react-client-sdk` provides `useLDClient` hooks. React context propagates flags through the component tree naturally.                                                                                                                                                                   | The React SDK works inside React islands, but flag context doesn't propagate across `.astro` component boundaries. You'd need to thread flags through props or use a shared store like `nanostores`.                                                                                                                                                                                                                                                                                    |
| **Middleware-based targeting**  | Next.js Middleware can read cookies/headers, evaluate flags, and rewrite to variant routes before any rendering happens. This is the cleanest pattern for full-route A/B tests.                                                                                                                      | **Astro middleware is fully equivalent here.** The `onRequest()` handler has access to cookies, headers, and the full request. It supports `context.rewrite()` to serve different page content based on flags without a redirect — the URL stays the same, but the rendered content changes. It also supports `context.locals` for passing resolved flags downstream. Middleware can be chained via `sequence()` for clean separation of concerns (auth → flag resolution → analytics). |
| **Edge evaluation**             | Next.js Middleware can run on the edge (Vercel, Cloudflare) _or_ on the Node.js runtime. Choose per-deployment. LD's edge SDK or full Node SDK both work depending on the runtime.                                                                                                                   | Astro can deploy to edge runtimes (Cloudflare, Deno, Vercel Edge) and evaluate flags there. Astro's Vercel and Cloudflare adapters support edge middleware.                                                                                                                                                                                                                                                                                                                             |
| **Streaming + personalization** | React Server Components + Cache Components (`use cache`) can pre-render the static shell and stream personalized content into dynamic holes. This is now stable in Next.js 16 and is architecturally equivalent to Astro's Server Islands.                                                           | **Server Islands (Astro 5)** solve this cleanly for server-side personalization: the static shell streams from CDN instantly, and the personalized Server Island streams in with LD flags resolved server-side. Zero client JS for the personalization itself. However, you lose this benefit the moment you need client-side reactivity for personalized experiences.                                                                                                                  |

**Verdict: Next.js has a moderate edge.** For purely server-side flag evaluation, Astro's Server Islands actually offer a _better_ caching story than Next.js today (static shell cached, personalized island always fresh — no complex ISR/cookie-keyed cache logic). But Next.js's React-native flag propagation and client-side SDK integration make personalized pages with interactivity more natural to build. The deciding factor is whether personalization stays server-side-only or needs client-side reactivity.

---

### 5. Build Times

|                                  | Next.js                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Astro                                                                                                                                                                                                                                                                                                                                                                   |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cold build**                   | Moderate. The React compilation step and Turbopack bundling (now the default bundler in Next.js 16) add overhead. A 1,000-page site might take 2-5 minutes. Turbopack's file-system caching (stable in 16.1) significantly improves subsequent builds. _(Note: Verify whether Turbopack is the default for production builds (`next build`) or only for `next dev`. As of earlier versions, Turbopack was default for dev but Webpack was still used for production builds.)_ | Fast. Astro's Vite-based build is lean. Same 1,000-page site might build in 30-90 seconds.                                                                                                                                                                                                                                                                              |
| **Incremental builds (ISR)**     | Next.js ISR means you don't rebuild the whole site. Pages revalidate individually on a timer or via webhook. Build time becomes nearly irrelevant for content updates.                                                                                                                                                                                                                                                                                                        | Astro doesn't have page-level ISR. However, the [Content Layer API](https://docs.astro.build/en/guides/content-collections/) caches collection data between builds — if CMS content hasn't changed, the data fetch is skipped, speeding up rebuilds. For page-level freshness, use hybrid mode with on-demand SSR routes, or trigger full rebuilds via Sanity webhooks. |
| **Dev server startup**           | Fast. Turbopack is the default dev bundler in Next.js 16 (`next dev` uses it automatically). Hot reload is near-instant.                                                                                                                                                                                                                                                                                                                                                      | Very fast. Vite's dev server is excellent.                                                                                                                                                                                                                                                                                                                              |
| **Monorepo build orchestration** | Turborepo caches builds across the monorepo. Next.js integrates well with `.next/**` output tracking.                                                                                                                                                                                                                                                                                                                                                                         | Turborepo works equally well with Astro's `dist/**` output.                                                                                                                                                                                                                                                                                                             |

**Verdict: Astro wins on cold build speed, but Next.js ISR makes it irrelevant for content updates.** For a CMS-driven site where content editors publish frequently, ISR's ability to update individual pages without a full rebuild is a significant operational advantage.

---

### 6. Interactivity Model

|                                 | Next.js                                                                                                                                                                                                                                             | Astro                                                                                                              |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Default**                     | Everything is React. Client Components hydrate on the client; Server Components render on the server. You choose per-component. Next.js 16's React Compiler automatically memoizes components, reducing manual `useMemo`/`useCallback` boilerplate. | Everything is static HTML. You opt into interactivity per-component via `client:*` directives (islands).           |
| **Interactive features needed** | Mortgage calculators, listing search/filter, map integrations, form wizards, image galleries, tab navigation — a house listing site has significant interactivity.                                                                                  | Each of these would be a React island. The plumbing for each island is manageable but adds architectural overhead. |
| **State sharing**               | React context, Zustand, or any state library works across the whole page.                                                                                                                                                                           | State doesn't naturally flow between islands. You'd use `nanostores`, custom events, or URL state.                 |
| **Forms**                       | React Hook Form, server actions, or any React form library. Progressive enhancement with `useFormStatus`.                                                                                                                                           | Forms in `.astro` files work with standard HTML. Interactive forms need a React island.                            |

**Verdict: Next.js wins for this use case.** A house listing site is not a blog — but the interactivity story is nuanced. The key question is whether interactive components on a page _share state_ with each other. A listing detail page with a photo gallery, a mortgage calculator, and an embedded map works fine as separate Astro islands because they're independent. A search results page where filters, map pins, listing cards, and a "save search" button all share state becomes painful in Astro — you'd need `nanostores`, custom events, or a single mega-island that defeats the purpose. For this project, search/filter pages with shared state are a core feature, not an edge case. Next.js's unified React tree handles this naturally; Astro's island model adds meaningful architectural friction for state-heavy pages.

---

### 7. A/B Testing — Full-Page & Element-Level

A/B testing via LaunchDarkly will happen at two granularities:

- **Full-page variants** — entirely different page compositions (different `sections[]` arrays) served based on a flag. Think: homepage variant A vs. variant B with completely different layouts.
- **Element-level flags** — individual components or content blocks toggled by flags. Think: different hero headline, a promo banner shown/hidden, a CTA color change, a different pricing display.

Both patterns need to work well. Full-page is the harder architectural problem; element-level is more frequent in day-to-day operations.

#### Element-Level Flags

|                                  | Next.js                                                                                                                                                                                                     | Astro                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Server-side element flags**    | Straightforward. A Server Component reads the flag and conditionally renders. `const showPromo = await ldClient.variation('promo-banner', user, false);` then render or skip the component. Zero client JS. | **Equally straightforward with Server Islands.** Wrap the flagged element in a `server:defer` island. The flag resolves server-side, the element renders (or doesn't), and the static shell around it stays cached. Clean and zero client JS.                                                                                                                                               |
| **Client-side element flags**    | `useLDClient()` hook inside any React component. Flag changes re-render just that component. Multiple flagged elements on the same page share one LD client context — no coordination needed.               | Works inside React islands via the LD React SDK. However, each flagged element is its own island. If multiple elements on the same page are flag-controlled, you need to either (a) put them in the same island (coupling unrelated components), (b) use `nanostores` or a shared store to sync flag state across islands, or (c) accept multiple LD client initializations. More plumbing. |
| **Flag-driven content from CMS** | Server Component fetches the flag, then fetches the matching Sanity content. Single render pass.                                                                                                            | Server Island does the same thing server-side. Equivalent.                                                                                                                                                                                                                                                                                                                                  |
| **Flag-driven UI variations**    | Conditional rendering in React — `{showBanner && <PromoBanner />}`. Trivial.                                                                                                                                | Inside a Server Island (server-side) or a React island (client-side), equally trivial. But if the flag controls something outside an island (in the `.astro` template), you need SSR mode for that page or a Server Island wrapper.                                                                                                                                                         |

**Element-level verdict: Next.js is simpler for client-side flags across multiple elements.** Server-side element flags are a wash — both frameworks handle them cleanly. But when multiple scattered elements on a page are flag-controlled client-side, Next.js's single React tree with shared LD context is significantly cleaner than Astro's multi-island coordination.

#### Full-Page Variants

#### The Server Islands Factor (Astro 5+)

Astro's **Server Islands** (stable since Astro 5) are worth addressing directly because they change the full-page A/B story. A Server Island is a component that renders on the server on every request, even when the rest of the page is statically generated. The static shell is served instantly from the CDN, and the server island streams in its personalized content with a fallback/placeholder shown while it resolves.

This means a page could be structured like:

```astro
---
// src/pages/[slug].astro — statically generated at build time
---
<Layout>
  <StaticHeader />
  <!-- This part renders on the server per-request, evaluating LD flags -->
  <PersonalizedSections server:defer>
    <LoadingSkeleton slot="fallback" />
  </PersonalizedSections>
  <StaticFooter />
</Layout>
```

Inside `PersonalizedSections`, the LaunchDarkly Node SDK resolves the flag server-side, fetches the correct variant's `sections[]` from Sanity, and returns fully rendered HTML. **No client-side JavaScript is needed for the personalization logic itself.** The static parts of the page (header, footer, navigation) come from the CDN instantly, and the personalized content streams in from the server.

This is a genuinely compelling pattern. It combines Astro's zero-JS static performance with per-request server-side personalization. Next.js 16 achieves a similar result with Cache Components (`use cache` directive) — components or pages can be cached while dynamic holes stream in. This is now stable in Next.js 16, making the two approaches architecturally comparable.

#### Full-Page Comparison

|                                   | Next.js                                                                                                                                                                                                                                                                                   | Astro (with Server Islands)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Full-route variants**           | Middleware rewrites to `/page?variant=B` → same route renders different content based on server-side flag resolution. The page is a single React tree; swapping sections is trivial.                                                                                                      | **Three good options:** (1) Middleware `context.rewrite('/page-variant-b')` serves entirely different page content while keeping the original URL — the user sees `/page` but the server renders the variant route. No redirect, no query params exposed. (2) Middleware stores the flag in `context.locals` and the page reads it to fetch variant content from Sanity. (3) Server Islands let you statically generate the page shell and defer only the personalized sections to per-request server rendering. The static shell loads instantly; the variant streams in. |
| **Section-level variants**        | A block renderer receives different `sections[]` arrays based on the resolved variant. One component, one render path.                                                                                                                                                                    | A Server Island wrapping a React block renderer (via `server:defer`) works cleanly. The LD flag is resolved server-side inside the island, the correct `sections[]` are fetched from Sanity, and the component renders the blocks. Architecturally sound.                                                                                                                                                                                                                                                                                                                  |
| **Static + personalized hybrid**  | Next.js 16 Cache Components (`use cache`) can serve a cached static shell and stream in dynamic holes — conceptually identical to Server Islands and **now stable**. Per-component caching granularity means the page's static parts are cached while personalized sections render fresh. | **Also a strength for Astro.** Server Islands are the stable, production-ready version of this pattern. A page can be 90% static (cached at the CDN) with a single server island that resolves personalization. Both frameworks now have a stable solution for this pattern.                                                                                                                                                                                                                                                                                               |
| **Client-side variant switching** | If a variant needs to change without a full page reload (e.g., the user's segment updates mid-session), React re-renders the component tree. Seamless.                                                                                                                                    | Server Islands render on the server, so mid-session variant changes require a page reload or a navigation to re-trigger the server render. For true client-side reactivity, you'd still need a client-side React island with the LD React SDK.                                                                                                                                                                                                                                                                                                                             |
| **Caching personalized pages**    | Cache Components (`use cache`) let you cache the static shell while dynamic/personalized holes are excluded. Granular `cacheLife` and `cacheTag` APIs control per-component TTLs and on-demand revalidation. The `use cache` directive is stable in Next.js 16.                           | Server Islands are excluded from the page cache by design. The static shell is fully cached at the CDN; the island is always server-rendered fresh. Both approaches are now production-ready; Astro's model is slightly simpler conceptually (static HTML + deferred island), while Next.js offers more granular cache control APIs.                                                                                                                                                                                                                                       |
| **Analytics & tracking**          | LaunchDarkly + React means you can fire impression events from the same component tree that renders the variant.                                                                                                                                                                          | If the Server Island includes a small client-side script or a React island for tracking, impression events work. Alternatively, server-side analytics (LD's server SDK tracks evaluations automatically) cover the basic case without client JS.                                                                                                                                                                                                                                                                                                                           |

#### Honest Assessment

For **full-page server-side A/B testing**, both frameworks now have stable solutions. Astro's Server Islands give you a CDN-cached static shell with per-request personalized islands — zero client JS for the personalization logic. Next.js 16's Cache Components achieve the same architecture: cached shell + dynamic streaming holes. The approaches are conceptually equivalent and both production-ready. Astro's version is arguably simpler (pure HTML + deferred component); Next.js offers more granular cache control (`cacheLife`, `cacheTag`, on-demand revalidation).

For **element-level flags**, Next.js is meaningfully simpler. When you need 5 different elements on a page each controlled by their own flag — some server-resolved, some client-reactive — React's unified component tree with shared LD context handles this naturally. In Astro, each flagged element needs its own island or needs to be composed into a larger island, and client-side flag state doesn't flow between islands without extra wiring.

For **client-side variant switching** (flag changes mid-session without a reload), Next.js wins outright. Server Islands can't re-render without a page navigation.

#### Next.js Full-Route A/B Testing Pattern

For full-route A/B tests where the entire page composition changes based on a LaunchDarkly flag, Next.js provides a clean server-side pattern using `getServerSideProps`. The flag is resolved on the server before any rendering, so the user receives the correct variant with zero client-side flicker:

```js
// pages/landing-page.js
import { withLDServerSideProps } from 'launchdarkly-react-client-sdk/server';

export const getServerSideProps = withLDServerSideProps({
  // LaunchDarkly environment details
});

const LandingPage = ({ flags }) => {
  if (flags.landingPageRework === 'variant') {
    return <VariantLandingPage />;
  }
  return <ControlLandingPage />;
};

export default LandingPage;
```

This pattern evaluates the flag on the server during `getServerSideProps`, passes the resolved flags as props, and renders the appropriate full-page variant — all in a single server round-trip. The URL stays the same regardless of variant, making it transparent to the user and compatible with analytics tracking. For the App Router equivalent, the same logic moves into a Server Component with the LaunchDarkly Node SDK evaluated directly in the component body.

**Verdict: Slight Next.js advantage overall.** Full-page server-side A/B testing is close to a draw (Astro may even be better). But the combination of element-level flags + client-side reactivity + shared flag context tips the balance toward Next.js. The real question is how much of our A/B testing is server-side full-page vs. client-side element-level — the more it skews toward the latter, the stronger the Next.js case.

---

### 8. Image Optimization

For a house listing site with hundreds of property photos per community, image handling is a core performance concern, not a nice-to-have.

|                           | Next.js                                                                                                                                                                                                                      | Astro                                                                                                                                                                                                                                                    |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Built-in component**    | `next/image` — automatic resizing, format conversion (WebP/AVIF), lazy loading, blur-up placeholders, and responsive `srcset` generation. Works with local and remote images.                                                | `<Image>` and `<Picture>` components via `astro:assets`. Uses `sharp` under the hood for resizing and format conversion. Supports responsive images, lazy loading, and remote URLs.                                                                      |
| **CDN integration**       | On Vercel, image optimization is handled at the edge via the Image Optimization API — zero config. Self-hosted requires configuring a custom image loader or using a third-party CDN (Cloudinary, Imgix).                    | No built-in CDN optimization layer. Images are processed at build time (SSG) or request time (SSR). For production, you'd pair with a CDN or use Sanity's image pipeline (`@sanity/image-url`) directly.                                                 |
| **Sanity images**         | `@sanity/image-url` generates optimized Sanity CDN URLs with cropping, resizing, and format params. Combine with `next/image` for client-side lazy loading and blur placeholders. The two layers complement each other well. | Same `@sanity/image-url` library works. Astro's `<Image>` component can wrap the Sanity URL, but double-processing (Sanity CDN → sharp) is wasteful. In practice, you'd use Sanity's image pipeline directly and skip Astro's processing for CMS images. |
| **Placeholder / blur-up** | Built-in `placeholder="blur"` with automatic generation for local images. For remote images (Sanity), requires providing `blurDataURL` manually or via a helper.                                                             | No built-in blur-up. You'd need to generate low-quality placeholders manually or use Sanity's LQIP (Low Quality Image Placeholder) feature.                                                                                                              |
| **Art direction**         | `next/image` supports responsive `sizes` but not `<picture>` with multiple `<source>` elements natively. Use a custom component or `next/image` with CSS for art direction.                                                  | `<Picture>` component supports multiple `<source>` elements for true art direction (different crops/images at different breakpoints). Slightly better API for this use case.                                                                             |

**Verdict: Next.js wins on developer experience; both are adequate in production.** `next/image` provides more out-of-the-box conveniences (blur placeholders, automatic CDN optimization on Vercel, zero-config lazy loading). For a listing site where property photos are the primary visual content, these DX wins add up. However, since both frameworks can consume Sanity's image CDN directly (`@sanity/image-url`), the rendering framework is not the bottleneck for image performance — Sanity's pipeline does the heavy lifting regardless.

---

### 9. SEO & Metadata

Every property listing page needs unique meta tags, Open Graph images, JSON-LD structured data (RealEstateListing, Product, BreadcrumbList), and sitemap inclusion. Both frameworks handle this well, but the APIs differ.

|                               | Next.js                                                                                                                                                                               | Astro                                                                                                                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Metadata API**              | `generateMetadata` function (async, per-route) with full support for dynamic OG tags, canonical URLs, and alternates. Streaming-compatible — metadata can resolve alongside the page. | Metadata is set directly in the `<head>` of `.astro` layouts or pages. No dedicated API — you use standard HTML `<meta>` tags, which is simple but requires manual composition for dynamic pages. |
| **JSON-LD / Structured data** | No built-in helper. Use a library like `next-seo` or hand-write `<script type="application/ld+json">` in a Server Component.                                                          | Same approach — hand-write JSON-LD in the page's `<head>`. No framework-level abstraction in either case.                                                                                         |
| **Open Graph images**         | `next/og` (based on `@vercel/og`) generates dynamic OG images at the edge using JSX-like syntax. Powerful for generating listing-specific preview images on the fly.                  | No built-in OG image generation. Use a third-party service (Cloudinary, `@vercel/og` standalone) or pre-generate images at build time.                                                            |
| **Sitemaps**                  | `next-sitemap` (community package) or hand-roll a `sitemap.xml` route. ISR pages can complicate sitemap generation since not all pages exist at build time.                           | `@astrojs/sitemap` integration auto-generates a sitemap from all static routes. For hybrid/SSR routes, manual configuration is needed. Clean DX for static sites.                                 |
| **Robots / canonical**        | Configurable via `metadata` export or `robots.txt` route.                                                                                                                             | Standard file-based `robots.txt` in `public/`. Canonical tags set manually in layouts.                                                                                                            |

**Verdict: Next.js has a slight edge for dynamic metadata and OG images.** The `generateMetadata` API and `next/og` dynamic image generation are genuine conveniences for a listing site where every page needs unique social previews. Astro's approach is more manual but perfectly adequate — and for static pages, `@astrojs/sitemap` is arguably cleaner than Next.js's sitemap story. Neither framework is a blocker here.

---

### 10. Content Editor Preview Workflow

Content editors publishing listing pages, community descriptions, and marketing content need a fast feedback loop. How do they see unpublished changes before going live?

|                                | Next.js                                                                                                                                                                                                                   | Astro                                                                                                                                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Draft mode**                 | Built-in `draftMode()` API. A route handler enables draft mode (sets a cookie), and Server Components can conditionally fetch draft content from Sanity. Toggle on/off cleanly.                                           | No built-in draft mode. You'd implement this manually — check a cookie or query param in middleware, then fetch draft content from Sanity when enabled. Straightforward but requires custom wiring. |
| **Live preview (real-time)**   | `next-sanity` provides `useLiveQuery` and the Presentation tool integration. Editors see changes in real-time as they type in Sanity Studio — the preview iframe updates live. This is the gold standard for CMS preview. | `@sanity/astro` supports the Presentation tool and live preview, but the integration requires more setup and has fewer production examples. Real-time updating works but may feel less polished.    |
| **Visual editing overlays**    | Sanity's visual editing (click-to-edit overlays on the preview) is purpose-built for Next.js. Content Source Maps power the overlays. Mature and well-documented.                                                         | Supported via `@sanity/astro`, but the overlay integration is newer. The click-to-edit experience exists but has received less real-world testing.                                                  |
| **Preview across block types** | Since the Block Renderer is a React component running in Next.js, all 11+ block types preview natively. No additional work per block.                                                                                     | If blocks are React islands, they preview as expected. Pure `.astro` blocks would need their own preview wiring since they render at build time (SSG) or request time (SSR), not reactively.        |

**Verdict: Next.js wins for content editor experience.** For a site with frequent content publishing (new listings, community updates, marketing pages), the quality of the editor preview workflow directly impacts content team velocity. Sanity's Presentation tool, `useLiveQuery`, and visual editing overlays are built for Next.js first. Astro supports the same features, but the integration is less mature, less documented, and more likely to require debugging during setup. If content editors are primary stakeholders — and for a listing site, they are — this matters.

---

### 11. Hosting & Vendor Lock-In

|                               | Next.js                                                                                                                                                                                                                                                                                                                                                                                                           | Astro                                                                                                                                                                                                                      |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Golden-path host**          | Vercel. Every Next.js feature (ISR, image optimization, middleware, edge functions, Cache Components, analytics) works out of the box on Vercel with zero configuration.                                                                                                                                                                                                                                          | No single preferred host. Astro deploys well to Vercel, Cloudflare Pages, Netlify, Deno Deploy, and AWS via community adapters. Multi-host flexibility is a core design goal.                                              |
| **Self-hosting**              | Improved but historically painful. `next start` runs a Node.js server, but features like ISR, image optimization, and Cache Components require additional infrastructure (Redis for cache, custom image loader, etc.). Next.js 16's **Build Adapters API** is designed to improve this by letting hosting platforms provide custom build targets — but it's new, and the ecosystem of adapters is still emerging. | `astro build` produces a standard Node.js server (or static files, or a Cloudflare Worker, etc.) depending on the adapter. The output is predictable and portable. No framework features are gated behind a specific host. |
| **Feature parity off Vercel** | Most features work self-hosted, but with caveats. ISR requires a persistent cache store. `next/image` optimization requires a custom loader or running the built-in optimizer (which adds CPU load). Cache Components need a cache backend. The gap between Vercel-hosted and self-hosted Next.js is narrowing but still real.                                                                                    | Feature parity is consistent across hosts. What works on Netlify works on Cloudflare works on a VPS. Adapter differences are minor (edge vs. Node runtime capabilities).                                                   |
| **Vendor switching cost**     | Moving a Next.js app off Vercel is possible but requires infrastructure work — setting up ISR caching, image optimization, middleware runtime, etc. Moving _to_ another framework's host is a larger effort.                                                                                                                                                                                                      | Switching hosts is typically a one-line adapter change (`@astrojs/vercel` → `@astrojs/cloudflare`). Low switching cost by design.                                                                                          |

**Verdict: Next.js wins — Vercel is confirmed.** With Vercel as the hosting platform, every Next.js feature (ISR, image optimization, Cache Components, middleware, edge functions, analytics) works out of the box with zero configuration. The vendor lock-in concern is accepted, and Next.js's first-party Vercel integration becomes a pure advantage rather than a trade-off. Astro's multi-host portability is a moot point for this project.

---

### 12. SSR Infrastructure Cost

LaunchDarkly personalization and A/B testing will push many pages into server-side rendering. This has cost implications that differ between frameworks.

|                          | Next.js                                                                                                                                                                                                                                                 | Astro                                                                                                                                                                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Default SSR scope**    | When a page uses personalization, the entire page renders on the server (unless Cache Components are used to carve out static portions). The default posture is "whole page renders server-side."                                                       | With Server Islands, only the personalized _island_ hits the server. The rest of the page is static HTML served from CDN. The default posture is "only the dynamic part renders server-side."                                                    |
| **Compute per request**  | A personalized page request executes the full React Server Component tree for that route. Cache Components (`use cache`) reduce this by caching static subtrees — but you must explicitly opt components _into_ caching. Uncached = full server render. | A personalized page request serves static HTML from CDN instantly, then makes a secondary request to render just the Server Island. Server compute is proportional to the _island size_, not the page size.                                      |
| **Cache granularity**    | `use cache` with `cacheLife` and `cacheTag` provides fine-grained control. You can cache the header, footer, and sidebar while rendering the listing content fresh. Powerful but requires explicit annotation of every cacheable component.             | Server Islands are excluded from the page cache by design — the static shell is always cached, the island is always fresh. Binary and simple. Less control, but the happy path (cached shell + fresh personalization) requires no configuration. |
| **Scaling implications** | At scale (thousands of personalized pages, high traffic), server compute costs are driven by how much of each page is _not_ cached. Aggressive use of Cache Components can reduce this significantly, but it's opt-in work.                             | At scale, server compute costs are driven only by island rendering. If our personalized island is a small portion of the page, Astro's model is inherently cheaper per request.                                                                 |
| **Edge rendering**       | Supported on Vercel Edge and Cloudflare (with appropriate adapters). Edge rendering reduces latency but may increase cost depending on the provider's pricing model.                                                                                    | Same edge support via adapters. Server Islands can render on edge workers, keeping latency low for the dynamic portion.                                                                                                                          |

**Verdict: Astro has a structural advantage for SSR cost efficiency.** Server Islands' "static shell + dynamic island" model means you only pay for server compute on the personalized portion of each page, by default. Next.js can achieve the same granularity with Cache Components, but it requires explicit opt-in per component — the default is a full server render. For a high-traffic listing site with personalization on every page, this difference in default posture could translate to meaningful infrastructure cost savings with Astro. That said, a well-optimized Next.js deployment with aggressive caching can close this gap — it just requires more deliberate architecture.

---

### 13. Learning Curve & Hiring

|                                    | Next.js                                                                                                                                                                                                                                                                                                    | Astro                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Ramp-up for a React team**       | React knowledge transfers directly. Next.js adds routing conventions, Server Components, and server actions on top of React — concepts that are well-documented and widely taught.                                                                                                                         | Astro's `.astro` file format, island directives (`client:load`, `client:visible`, `server:defer`), and content collections are new concepts. Moderate ramp-up even for experienced React devs.                                                                                                                                                                                                                                               |
| **Ramp-up complexity**             | Next.js 16 with App Router, Server Components, Cache Components (`use cache`), and the React Compiler has a steeper learning curve than Next.js historically. Not trivial — but the volume of learning resources, tutorials, and community answers is massive, and these features are stabilizing rapidly. | Astro is simpler in isolation — the mental model of "HTML + islands" is clean. But integrating it with Sanity, LaunchDarkly, and React Native sharing adds complexity that fewer people have navigated before. Fewer Stack Overflow answers, fewer blog posts, fewer production case studies.                                                                                                                                                |
| **Hiring pool**                    | React/Next.js is the most common frontend stack globally. Finding experienced devs is straightforward. Virtually every frontend job posting from the last 5 years has listed React.                                                                                                                        | Astro's talent pool is a fraction of React/Next's. However, the ramp-up from React to Astro is modest — `.astro` files are essentially HTML with a frontmatter script block, and interactive components are still React. The real hiring concern isn't "can we find people who can write Astro" (any React dev can learn it in a week) but "can we find people who've debugged Astro + Sanity + LaunchDarkly in production" (very few have). |
| **Market share & longevity**       | Next.js has ~7M weekly npm downloads. It is Vercel's flagship product with significant corporate investment. React itself is maintained by Meta. The risk of abandonment or stagnation is near-zero.                                                                                                       | Astro has ~400K weekly npm downloads — growing fast, but 17x smaller. It's maintained by a smaller company (The Astro Technology Company). The framework is healthy and well-funded, but the long-term bet carries more uncertainty.                                                                                                                                                                                                         |
| **Contractor/agency availability** | Any frontend agency or contractor can staff a Next.js project. It's the default assumption.                                                                                                                                                                                                                | Finding agencies with Astro experience requires more vetting. Most would need to learn it on our project.                                                                                                                                                                                                                                                                                                                                   |

**Verdict: Next.js wins — and this is one of the most practically important criteria.** Framework choices outlast individual projects. The ability to hire quickly, onboard contractors, find answers to obscure integration questions, and bet on long-term ecosystem stability matters as much as any technical comparison. Next.js's market dominance is a compounding advantage. That said, Astro's learning curve for React developers is often overstated — the framework itself is simple. The real gap is in production-grade integration knowledge (debugging Sanity previews in Astro, wiring LaunchDarkly through Server Islands, etc.), which has far fewer community resources.

---

### 14. Ecosystem & Community

|                              | Next.js                                                                                                                                            | Astro                                                                                                                       |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **NPM downloads**            | ~7M/week                                                                                                                                           | ~400K/week                                                                                                                  |
| **GitHub stars**             | ~130K                                                                                                                                              | ~50K                                                                                                                        |
| **Vercel integration**       | First-party. Optimized deployment, analytics, edge functions, image optimization. Next.js 16 adds a Build Adapters API for custom hosting targets. | Excellent Vercel adapter, but not first-party. Strong multi-host story: deploys well to Cloudflare, Netlify, Deno, and AWS. |
| **Third-party integrations** | Nearly every SaaS (analytics, A/B testing, CMS, auth) has a Next.js example or SDK.                                                                | Growing fast but gaps exist. LaunchDarkly doesn't have an official Astro integration.                                       |
| **Enterprise adoption**      | Proven at enterprise scale (Nike, Hulu, TikTok, Notion).                                                                                           | Growing in the content/marketing site space. Fewer enterprise references for dynamic/personalized sites.                    |

**Verdict: Next.js wins.** The ecosystem depth matters when integrating multiple third-party services.

---

### 15. Internationalization

|                                  | Next.js                                                                                                                                                                                          | Astro                                                                                                                                                                                             |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Built-in i18n routing**        | Built-in. `next.config.js` supports `i18n` with locale detection, sub-path routing (`/en/`, `/es/`), domain routing, and default locale configuration. Middleware can handle locale negotiation. | No built-in i18n routing. Community solutions exist (`astro-i18next`, `astro-i18n-aut`), or you can implement manual sub-path routing with dynamic `[lang]` segments. More manual setup required. |
| **Content translation**          | Framework-agnostic. Sanity handles multi-locale content natively (document-level or field-level translations). Both frameworks consume the same GROQ queries with locale filters.                | Same — Sanity's i18n approach is CMS-side, not framework-side.                                                                                                                                    |
| **Static generation per locale** | `generateStaticParams` can produce pages for each locale. ISR revalidates per-locale pages independently.                                                                                        | Static generation per locale works via dynamic `[lang]` route segments. Each locale generates its own page set at build time.                                                                     |

**Verdict: Next.js has a convenience edge if i18n is needed.** Built-in locale routing, detection, and domain-based i18n reduce boilerplate. Astro requires manual setup or community plugins. However, for this project, **if the listing site serves a single market/language, this criterion is irrelevant** — and it should be weighted at 0%. If multi-market expansion is on the roadmap, Next.js's built-in support is a meaningful advantage. Explicitly confirm scope before weighting this factor.

---

### 16. Future Migration Path

This is a crucial consideration. **Starting with Next.js does not lock you out of Astro.**

| Migration aspect            | Effort                                                                                                                                                                                                                                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Sanity queries & client** | Reusable as-is. `@sanity/client` works in both frameworks.                                                                                                                                                                                                                                       |
| **React components**        | Drop directly into Astro as React islands. The `BlockRenderer` and all block components would work inside `client:load` or `client:visible` directives.                                                                                                                                          |
| **TypeScript types**        | Fully portable.                                                                                                                                                                                                                                                                                  |
| **Tailwind styles**         | Fully portable.                                                                                                                                                                                                                                                                                  |
| **Sanity schemas**          | Unchanged. The CMS layer is framework-agnostic.                                                                                                                                                                                                                                                  |
| **LaunchDarkly logic**      | Server-side flag evaluation would move to Astro middleware/endpoints. Client-side React SDK would work inside islands.                                                                                                                                                                           |
| **Routing**                 | Both use file-based routing. Convention differences (`app/` vs `src/pages/`, layout nesting vs. Astro layouts, dynamic segments syntax) require rewriting but the logic maps 1:1. Astro supports dynamic routes, rest params, rewrites, redirects, and pagination natively. Low-moderate effort. |
| **Middleware**              | Both have middleware with `rewrite()`, `redirect()`, `cookies`, `headers`, and `locals`/`context` for passing data. The concepts map almost directly. Low effort.                                                                                                                                |

**Key insight:** The migration from Next.js → Astro is largely mechanical for a Sanity-driven site. The content layer (Sanity), the component layer (React), and the styling layer (Tailwind) are all portable. What changes is the routing/rendering framework — and that's a one-time effort.

The reverse migration (Astro → Next.js) would be similarly possible, but `.astro` components would need to be rewritten as React components — which is more work than the other direction.

---

## Weighted Scorecard

| Criterion                         | Weight | Next.js | Astro | Notes                                                                                                                |
| --------------------------------- | ------ | ------- | ----- | -------------------------------------------------------------------------------------------------------------------- |
| Sanity CMS Integration            | 8%     | 9/10    | 7/10  | Sanity's tooling is React/Next-first                                                                                 |
| React Native Code Sharing         | 8%     | 9/10    | 5/10  | Shared data/logic layer is the real win; UI sharing is limited in practice                                           |
| Performance (SSG/SSR)             | 10%    | 7/10    | 9/10  | Astro's zero-JS default is hard to beat                                                                              |
| LaunchDarkly Personalization      | 10%    | 9/10    | 7/10  | Server-side is near-parity (Server Islands ≈ Cache Components); client-side React flag propagation is superior       |
| Build Times                       | 5%     | 7/10    | 9/10  | ISR offsets Astro's faster cold builds                                                                               |
| Interactivity                     | 10%    | 9/10    | 6/10  | Search/filter pages with shared state are the bottleneck, not individual interactive components                      |
| A/B Testing (Full-Page + Element) | 12%    | 9/10    | 7/10  | Full-page server-side is at parity (both stable); element-level flags + client-side reactivity favor Next            |
| Image Optimization                | 5%     | 8/10    | 7/10  | `next/image` DX wins; both use Sanity's image CDN in practice                                                        |
| SEO & Metadata                    | 3%     | 8/10    | 7/10  | `generateMetadata` + `next/og` are conveniences; neither framework is a blocker                                      |
| Content Editor Preview            | 5%     | 9/10    | 6/10  | Sanity Presentation tool, `useLiveQuery`, visual editing overlays are built for Next.js                              |
| Hosting & Vendor Lock-In          | 5%     | 10/10   | 9/10  | Vercel confirmed — Next.js's first-party integration is a pure advantage                                             |
| SSR Infrastructure Cost           | 4%     | 7/10    | 9/10  | Server Islands' granular SSR scope is structurally cheaper at scale                                                  |
| Learning Curve & Hiring           | 12%    | 9/10    | 6/10  | Market share, hiring pool, integration knowledge availability; Astro ramp-up is modest but ecosystem support is thin |
| Ecosystem & Community             | 8%     | 9/10    | 7/10  | Enterprise depth, third-party SDKs, community size                                                                   |
| Internationalization              | 0%\*   | 8/10    | 5/10  | \*Weight is 0% unless multi-market expansion is confirmed; included for completeness                                 |
| Future Migration Path             | 5%     | 8/10    | 7/10  | Next → Astro is easier than Astro → Next                                                                             |

\* Internationalization is weighted at 0% pending confirmation of multi-market requirements. If i18n is needed, re-weight to 3-5% and reduce other criteria proportionally.

### Weighted Scores

- **Next.js: 8.58 / 10**
- **Astro: 6.93 / 10**

> **Weight justification:** Hiring/talent and A/B testing carry the highest weights (12% each) because they have the most compounding impact on a production project — hiring affects every sprint, and A/B testing is a core product requirement that touches architecture daily. Build times are low (5%) because ISR makes cold builds infrequent for content updates. Hosting is weighted at 5% and is now a confirmed Next.js advantage with Vercel as the deployment target. SSR cost is weighted modestly (4%) because it's manageable with architecture decisions. Internationalization is excluded until scope is confirmed — adding it at 5% would widen the gap slightly in Next.js's favor.

---

## Recommendation

**Use Next.js.**

The decision is driven by three reinforcing factors:

1. **Hiring and ecosystem are a compounding advantage.** Next.js's market dominance (~7M weekly downloads vs. ~400K) means a dramatically larger talent pool, more agency/contractor availability, more Stack Overflow answers, more blog posts, and more production case studies for every integration you'll need (Sanity, LaunchDarkly, React Native, etc.). This advantage compounds over the life of the project. Astro's ramp-up for React developers is modest, but the scarcity of production-grade integration knowledge (Astro + Sanity + LaunchDarkly + personalization) is a real constraint.

2. **A/B testing spans both full-page and element-level, server-side and client-side.** Full-page server-side A/B testing is at parity — both Next.js 16 Cache Components and Astro Server Islands offer stable, production-ready static-shell + dynamic-personalization patterns. But element-level flags scattered across a page, client-side variant switching, and shared flag context across components are significantly cleaner in a unified React tree. A house listing site will use both patterns extensively.

3. **React Native code sharing is a force multiplier — at the data layer.** The monorepo includes a mobile app, with the possibility of more. While UI component sharing between web and native is limited in practice (different layout paradigms), a React-everywhere strategy means TypeScript types, Sanity queries, hooks, validation logic, and business logic are shared assets. With Astro, the web's rendering layer becomes a silo — interactive components are React islands anyway, but you lose the unified component model and the ability to share patterns between web and mobile rendering code.

### When Astro Would Be the Better Choice

Astro would be the right call if:

- The site were primarily content/marketing pages with minimal interactivity
- There were no React Native apps to share code with
- Personalization were strictly server-side (LD flags resolved per-request, no client-side variant switching) — Server Islands make this pattern genuinely excellent in Astro
- Build performance for thousands of static pages were the primary bottleneck
- The team wanted to minimize client-side JavaScript at all costs
- The caching story needed to be maximally simple: Astro's Server Islands have a clean, intuitive cache model (static HTML + deferred islands) with less API surface than Next.js's `use cache` / `cacheLife` / `cacheTag` system
- **SSR infrastructure cost were the primary constraint** — Server Islands' granular rendering scope (only the dynamic island hits the server) is structurally cheaper than full-page SSR at high traffic volumes

### The Escape Hatch

If performance profiling down the road reveals that Next.js's JavaScript payload is hurting Core Web Vitals on content-heavy pages (listing directories, blog posts, static marketing pages), an incremental migration path exists:

1. **Phase 1:** Extract content-heavy routes into an Astro sub-app within the monorepo (`apps/marketing/`).
2. **Phase 2:** Use the existing React components as Astro islands with `client:visible` for lazy hydration.
3. **Phase 3:** Rewrite high-traffic static pages as pure `.astro` components if the React overhead is measurable.

This phased approach lets you start fast with Next.js today while keeping the door open for Astro where it makes the most sense — all without a big-bang rewrite.

---

## Appendix: Migration Escape Hatch

### What a Next.js → Astro migration looks like in this monorepo

```
monorepo/
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

| Asset                                  | Reusability                   |
| -------------------------------------- | ----------------------------- |
| `@sanity/client` setup                 | Direct import                 |
| GROQ queries                           | Direct import                 |
| TypeScript types (blocks, pages)       | Direct import                 |
| React components (BlockRenderer, etc.) | Use as Astro React islands    |
| Tailwind config & styles               | Copy or share via package     |
| Sanity schemas                         | Completely framework-agnostic |
| LaunchDarkly server-side logic         | Port to Astro middleware      |

### What must be rewritten

| Asset                                                        | Effort                                                                                                                                                           |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| File-based routing (`app/` → `src/pages/`)                   | Low-moderate — structural, not logical. Both use file-based routing; convention differences are mechanical.                                                      |
| `next/image` → Astro `<Image>` or `<Picture>`                | Low — API is similar                                                                                                                                             |
| Middleware (Next.js → Astro)                                 | Low — both have `rewrite()`, `redirect()`, `cookies`, `headers`, `locals`. Near-direct port.                                                                     |
| `next/font` → Astro font loading                             | Low                                                                                                                                                              |
| Server actions → Astro actions or API routes                 | Low-moderate — Astro 5 has built-in actions with type-safe validation                                                                                            |
| Cache Components / ISR → rebuild triggers or adapter caching | Moderate — Next.js `use cache` / `cacheLife` / `cacheTag` have no direct Astro equivalent. Use hybrid mode + on-demand SSR routes or webhook-triggered rebuilds. |

**Bottom line:** The migration cost is real but bounded. It's a weeks-long effort, not a months-long one, because the hard parts (content modeling, component design, Sanity integration) are already framework-agnostic.
