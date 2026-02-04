# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Astro + Sanity CMS real estate community showcase (D.R. Horton). Combines a static/SSR Astro frontend with Sanity headless CMS for content management.

- **Frontend**: Astro 5 with React, Tailwind CSS 4, TypeScript
- **CMS**: Sanity Studio at `/admin` endpoint
- **Deployment**: Vercel with Node.js SSR adapter

## Commands

```bash
pnpm dev          # Dev server on localhost:4321
pnpm build        # Production build to ./dist/
pnpm preview      # Preview production build
pnpm format       # Format code with Prettier
pnpm format:check # Check formatting

# Data scripts (populate Sanity from D.R. Horton API)
pnpm scrape:communities      # Scrape community data
pnpm scrape:areas           # Scrape area/market info
pnpm cleanup:areas          # Clean area data
pnpm link:communities       # Link communities to areas
```

## Architecture

### Directory Structure

- `src/pages/` - File-based routing (Astro)
- `src/components/` - Astro (.astro) and React (.tsx) components
- `src/lib/sanity.ts` - Sanity client, TypeScript types, GROQ queries
- `src/lib/load-query.ts` - Visual editing query wrapper
- `studio/schemaTypes/` - Sanity schema definitions
- `studio/components/` - Custom Sanity Studio preview components
- `scripts/` - Node.js data scraping/migration scripts

### Sanity Integration

**Schema Types**: post, author, category, state, community, areas

**Client Usage**:

```typescript
import { sanityClient } from "sanity:client"; // Published content
import { getClient } from "@/lib/sanity"; // Draft-aware client
```

**GROQ Queries**: Defined as constants in `src/lib/sanity.ts` (e.g., `POSTS_QUERY`, `COMMUNITIES_BY_STATE_QUERY`)

**Visual Editing**: Uses `loadQuery()` from `src/lib/load-query.ts` for stega-encoded responses enabling live preview in Studio.

### Dynamic Routes

- `/blog/[slug]` - Blog posts
- `/states/[state]` - Communities by state
- `/communities/[id]` - Individual community pages
- `/category/[category]`, `/author/[author]`, `/tag/[tag]`

### Draft Mode

API endpoints at `/api/draft-mode/enable` and `/api/draft-mode/disable` toggle between published and draft content visibility.

## Environment Variables

```
PUBLIC_SANITY_PROJECT_ID=9mua1ulx
PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=...  # For visual editing/draft mode
```

## Sanity Studio

Located in `studio/` with its own `package.json`. Key files:

- `studio/sanity.config.ts` - Studio configuration
- `studio/deskStructure.ts` - Custom document list structure
- `studio/schemaTypes/` - Content type schemas

Custom preview components render state flags and image URLs in the Studio interface.

## Scraping Data

I want to scrape the data from drhorton.com to begin new prototyping efforts.

The information architecture is as follows:

State

- Area
  - Community
    - Floor Plans
    - Houses

The URLs are as follows:

https://www.drhorton.com/alabama
https://www.drhorton.com/alabama/auburn-opelika
https://www.drhorton.com/alabama/auburn-opelika/auburn
https://www.drhorton.com/alabama/auburn-opelika/auburn/links-crossing
https://www.drhorton.com/alabama/auburn-opelika/auburn/links-crossing/floor-plans/beau
https://www.drhorton.com/alabama/auburn-opelika/auburn/links-crossing/floor-plans/cree
https://www.drhorton.com/alabama/auburn-opelika/auburn/links-crossing/floor-plans/harp
https://www.drhorton.com/alabama/auburn-opelika/auburn/links-crossing/floor-plans/noah
https://www.drhorton.com/alabama/auburn-opelika/auburn/links-crossing/floor-plans/ozar
https://www.drhorton.com/alabama/auburn-opelika/auburn/links-crossing/floor-plans/prin
https://www.drhorton.com/alabama/auburn-opelika/auburn/links-crossing/floor-plans/will
https://www.drhorton.com/alabama/auburn-opelika/auburn/the-preserve
https://www.drhorton.com/alabama/auburn-opelika/auburn/the-preserve/floor-plans/camd
https://www.drhorton.com/alabama/auburn-opelika/auburn/the-preserve/floor-plans/caro
https://www.drhorton.com/alabama/auburn-opelika/auburn/the-preserve/floor-plans/dest
https://www.drhorton.com/alabama/auburn-opelika/auburn/the-preserve/floor-plans/hawt
https://www.drhorton.com/alabama/auburn-opelika/auburn/the-preserve/floor-plans/madi
https://www.drhorton.com/alabama/auburn-opelika/auburn/the-preserve/floor-plans/pipe
https://www.drhorton.com/alabama/auburn-opelika/auburn/the-preserve/qmis/2152-bluebird-drive
https://www.drhorton.com/alabama/auburn-opelika/auburn/the-preserve/qmis/2159-bluebird-drive
https://www.drhorton.com/alabama/auburn-opelika/auburn/the-preserve/qmis/2165-bluebird-drive
https://www.drhorton.com/alabama/auburn-opelika/auburn/the-preserve/qmis/2170-bluebird-drive
https://www.drhorton.com/alabama/auburn-opelika/auburn/the-preserve/qmis/2176-bluebird-drive
https://www.drhorton.com/alabama/auburn-opelika/auburn/the-preserve/qmis/2177-bluebird-drive
https://www.drhorton.com/alabama/auburn-opelika/auburn/the-preserve/qmis/2182-bluebird-drive
https://www.drhorton.com/alabama/auburn-opelika/auburn/the-preserve/qmis/2183-bluebird-drive
https://www.drhorton.com/alabama/auburn-opelika/auburn/the-preserve/qmis/2188-bluebird-drive
https://www.drhorton.com/alabama/auburn-opelika/auburn/the-preserve/qmis/2194-bluebird-drive
https://www.drhorton.com/alabama/auburn-opelika/auburn/the-preserve/qmis/2195-bluebird-drive
https://www.drhorton.com/alabama/auburn-opelika/auburn/the-preserve/qmis/2200-bluebird-drive
