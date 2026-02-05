# Contentful vs Sanity: Enterprise CMS Comparison

**Prepared for:** Development & Content Team  
**Date:** February 2026  
**Purpose:** Comprehensive evaluation of headless CMS options with documentation links

---

## Executive Summary

| Criteria                    | Contentful                                 | Sanity                                                  |
| --------------------------- | ------------------------------------------ | ------------------------------------------------------- |
| **Best For**                | Structured workflows, governed content ops | Flexibility, real-time collaboration, developer control |
| **Content Modeling**        | UI-driven, max 50 fields/type              | Code-driven, unlimited schema                           |
| **Learning Curve**          | Moderate (editors), Steep (developers)     | Steep (initial setup), Flexible (ongoing)               |
| **Real-time Collaboration** | Limited (live preview, comments)           | Native (Google Docs-style co-editing)                   |
| **External Data**           | Custom External References (Premium)       | Sync Plugins + Input Plugins (all plans)                |
| **Content Triggers**        | Webhooks + Contentful Functions            | GROQ Webhooks + Sanity Functions                        |
| **A/B Testing**             | Via third-party integrations               | GrowthBook plugin with field-level experiments          |
| **Pricing Model**           | Tiered by features/API calls               | Per-seat with usage-based add-ons                       |
| **G2 Rating**               | 4.0 stars (299 reviews)                    | 4.5 stars (773 reviews)                                 |

---

## Enterprise Customers

### Contentful Enterprise Customers

Contentful is trusted by **~30% of Fortune 500 companies** and processes **90B+ API calls monthly**.

| Industry                       | Companies                         |
| ------------------------------ | --------------------------------- |
| **Food & CPG**                 | Kraft Heinz, KFC Global, Lactalis |
| **Technology**                 | Vodafone, Intercom, Atlassian     |
| **Retail & E-commerce**        | IKEA, Staples, Jack Wolfskin      |
| **Financial Services**         | Bank First, Chime                 |
| **Travel & Hospitality**       | APT Travel Group, Marriott        |
| **Healthcare & Life Sciences** | Biogen, HARTING                   |

**Case Study Highlights:**

- **Kraft Heinz**: 30% increased engagement, 78% conversion rate increase via MACH architecture  
  → [Case Study](https://www.contentful.com/case-studies/kraft-heinz/)
- **KFC Global**: 43% increase in digital sales, unified global websites  
  → [Case Study](https://www.contentful.com/case-studies/kfc-global/)
- **APT Travel Group**: 175% increase in online transactions  
  → [Case Study](https://www.contentful.com/case-studies/APT/)

**More Case Studies:** [contentful.com/case-studies](https://www.contentful.com/case-studies/)

---

### Sanity Enterprise Customers

Sanity powers **500+ websites in the top 100K globally**, with **1,200+ high-tech-spend companies ($10K+)** and **200+ companies with 1,000+ employees**.

| Industry                          | Companies                                                  |
| --------------------------------- | ---------------------------------------------------------- |
| **Consumer Goods & Retail**       | Unilever, Burger King, Sonos, Electrolux, PUMA             |
| **Life Sciences**                 | Takeda Pharmaceuticals                                     |
| **Technology & Digital Services** | Twitch, Stripe, Monzo, Unity, 8x8, Netlify, Redis, Elastic |
| **Media & Publishing**            | Substack, Medium, Yelp, Shutterstock, Unsplash             |
| **Industry & Logistics**          | Danfoss, Deliveroo, Too Good To Go                         |
| **Entertainment**                 | Lady Gaga, Complex, Morning Brew, Semafor                  |

**Case Study Highlights:**

- **PUMA**: Managing 50K reusable content pieces and 12K product categories hourly  
  → [Case Study](https://www.sanity.io/case-studies)
- **Too Good To Go**: 30% conversion increase (target was 7%), 22 languages  
  → [Case Study](https://www.sanity.io/projects/too-good-to-go)
- **OM System**: 70 store views, 20+ languages, 55+ modular blocks  
  → [Case Study](https://scandiweb.com/blog/om-system-one-of-the-biggest-sanity-cms-builds/)

**More Case Studies:** [sanity.io/case-studies](https://www.sanity.io/case-studies)

---

## Feature Comparison Matrix

### Content Modeling

| Feature                | Contentful                                         | Sanity                      |
| ---------------------- | -------------------------------------------------- | --------------------------- |
| **Schema Definition**  | Web UI                                             | JavaScript/TypeScript code  |
| **Content Types**      | Max 50 per space (Starter/Lite), higher on Premium | Unlimited                   |
| **Fields per Type**    | 50 max                                             | Unlimited                   |
| **Nested Objects**     | References only (no inline)                        | Inline objects + references |
| **Validation**         | UI-configured, limited regex                       | Full JavaScript functions   |
| **Conditional Fields** | Limited                                            | Full support                |
| **Version Control**    | Migration scripts                                  | Native (code in Git)        |

**Documentation:**

- Contentful: [Content Modeling](https://www.contentful.com/help/content-model/) | [Technical Limits](https://www.contentful.com/developers/docs/technical-limits/)
- Sanity: [Schema Types](https://www.sanity.io/docs/schema-types) | [Content Modeling Guide](https://www.sanity.io/docs/content-modelling)

---

### API & Rate Limits

| Metric                          | Contentful                     | Sanity                             |
| ------------------------------- | ------------------------------ | ---------------------------------- |
| **Content Delivery (reads)**    | 55 req/sec (Free), 78+ (Paid)  | 500 req/sec (no hard limit on CDN) |
| **Content Management (writes)** | 7-10 req/sec                   | 25 req/sec per IP                  |
| **Concurrent Queries**          | Not specified                  | 500 max                            |
| **Concurrent Mutations**        | Not specified                  | 100 max                            |
| **Monthly API Calls (Free)**    | 100K                           | 500K                               |
| **Monthly API Calls (Paid)**    | 1M (Lite), Unlimited (Premium) | 2.5M (Growth), Custom (Enterprise) |
| **GraphQL Mutations**           | ❌ Read-only                   | ❌ Not supported                   |
| **GraphQL Reads**               | ✅ Yes                         | ✅ Yes                             |
| **Proprietary Query**           | N/A                            | GROQ (reduces payload ~70%)        |

**Documentation:**

- Contentful: [Rate Limits](https://www.contentful.com/developers/docs/references/content-management-api/#/introduction/api-rate-limits)
- Sanity: [Technical Limits](https://www.sanity.io/docs/technical-limits) | [GROQ](https://www.sanity.io/docs/groq)

---

### Environments vs. Datasets

| Feature                | Contentful (Environments)               | Sanity (Datasets)                          |
| ---------------------- | --------------------------------------- | ------------------------------------------ |
| **Concept**            | Branch-like environments within a space | Independent data stores within a project   |
| **Default Limit**      | 2 (Free), 4 (Basic), Custom (Premium)   | 2 (Free), 2 (Growth), +$999/mo per extra   |
| **Cloning**            | ✅ Yes                                  | ✅ Yes (via CLI export/import)             |
| **Cross-reference**    | Within same space only                  | Within same project, cross-dataset queries |
| **Aliases**            | ✅ Supported (Premium)                  | N/A (use project-level config)             |
| **Independent Schema** | ✅ Yes                                  | ✅ Yes (per dataset)                       |

**Documentation:**

- Contentful: [Environments](https://www.contentful.com/help/environments/) | [Environment Aliases](https://www.contentful.com/help/environment-aliases/)
- Sanity: [Datasets](https://www.sanity.io/docs/datasets) | [Multi-tenancy](https://www.sanity.io/docs/developer-guides/multi-tenancy-implementation#8cf8789484b2)

---

### Migrations

| Feature               | Contentful                 | Sanity                                |
| --------------------- | -------------------------- | ------------------------------------- |
| **Migration Tool**    | `contentful-migration` CLI | `sanity migration` CLI                |
| **Approach**          | Imperative scripts         | Declarative + scripts                 |
| **Dry Run**           | ✅ Yes                     | ✅ Yes (default)                      |
| **Rollback**          | Manual scripting           | Manual (per-document via History API) |
| **Schema Merging**    | Merge App for diff/apply   | Schema changes via Git                |
| **CI/CD Integration** | ✅ Yes                     | ✅ Yes                                |

**Migration Example (Contentful):**

```javascript
module.exports = function (migration) {
  const blogPost = migration.createContentType("blogPost").name("Blog Post")
  blogPost.createField("title").name("Title").type("Symbol").required(true)
}
```

**Migration Example (Sanity):**

```javascript
// migrations/renameField.js
export default {
  title: "Rename location to address",
  documentTypes: ["venue"],
  migrate: {
    rename: { from: "location", to: "address" },
  },
}
```

**Documentation:**

- Contentful: [Migrations CLI](https://www.contentful.com/developers/docs/tutorials/cli/scripting-migrations/) | [Merge App](https://www.contentful.com/developers/docs/tutorials/cli/merge-app-cli/)
- Sanity: [Schema & Content Migrations](https://www.sanity.io/docs/schema-and-content-migrations) | [Migration Cheatsheet](https://www.sanity.io/docs/content-migration-cheatsheet)

---

### Scheduled Publishing & Releases

| Feature                   | Contentful                      | Sanity                           |
| ------------------------- | ------------------------------- | -------------------------------- |
| **Individual Scheduling** | ✅ Yes (all plans)              | ✅ Scheduled Drafts (Growth+)    |
| **Coordinated Releases**  | ✅ Launch App                   | ✅ Content Releases (Enterprise) |
| **Calendar View**         | ✅ Yes                          | ❌ Not built-in                  |
| **Max Scheduled Items**   | 200 per environment             | No documented limit              |
| **Timeline Preview**      | ✅ Timeline (Premium, Oct 2025) | Via releases preview             |
| **API Automation**        | ✅ Yes                          | ✅ Content Releases API          |

**Important Note:** Sanity's legacy Scheduled Publishing plugin was **deprecated October 2025**. Use Scheduled Drafts or Content Releases instead.

**Documentation:**

- Contentful: [Scheduled Publishing](https://www.contentful.com/help/scheduled-publishing/) | [Launch App](https://www.contentful.com/help/launch/) | [Timeline](https://www.contentful.com/blog/introducing-timeline/)
- Sanity: [Scheduled Publishing (deprecated)](https://www.sanity.io/docs/scheduled-publishing) | [Content Releases](https://www.sanity.io/blog/introducing-content-releases)

---

### Version History & Rollback

| Feature               | Contentful                   | Sanity                                                 |
| --------------------- | ---------------------------- | ------------------------------------------------------ |
| **Entry Versioning**  | ✅ All plans                 | ✅ All plans                                           |
| **Retention Period**  | Since Oct 2016               | 3 days (Free), 90 days (Growth), 365 days (Enterprise) |
| **Granular Restore**  | ✅ Field-level or full entry | ✅ Per-document only                                   |
| **Bulk Rollback**     | ❌ No                        | ❌ No (requires custom scripts)                        |
| **Dataset Snapshots** | Via environment cloning      | Backups (Enterprise only)                              |
| **Audit Logs**        | Premium/Enterprise           | Enterprise                                             |

**Documentation:**

- Contentful: [Version History](https://www.contentful.com/help/versions/)
- Sanity: [Document History](https://www.sanity.io/docs/history-api) | [History Retention](https://www.sanity.io/answers/restoring-previous-versions-of-documents-in-a-dataset)

---

### Multi-Tenancy & Organizations

| Feature                | Contentful       | Sanity                                |
| ---------------------- | ---------------- | ------------------------------------- |
| **Top-Level Entity**   | Organization     | Organization                          |
| **Project Containers** | Spaces           | Projects                              |
| **Data Isolation**     | Per-space        | Per-dataset                           |
| **Cross-Space Refs**   | ❌ No            | ✅ Within project                     |
| **Billing**            | Per-organization | Per-organization (Spring 2025 change) |
| **SSO/SAML**           | Premium only     | Enterprise (or $1,399/mo add-on)      |
| **Custom Roles**       | Premium only     | Enterprise                            |

**Documentation:**

- Contentful: [Spaces & Organizations](https://www.contentful.com/help/spaces-and-organizations/) | [Organizations](https://www.contentful.com/help/organizations/)
- Sanity: [Platform Terminology](https://www.sanity.io/docs/platform-terminology) | [Multi-tenancy Guide](https://www.sanity.io/docs/developer-guides/multi-tenancy-implementation#8cf8789484b2)

---

### UI Customization & Plugins

| Feature                    | Contentful        | Sanity                            |
| -------------------------- | ----------------- | --------------------------------- |
| **Customization Approach** | App Framework     | React components (schema-as-code) |
| **Marketplace Apps**       | 100+ integrations | 150+ plugins (Sanity Exchange)    |
| **Custom Fields**          | ✅ Via apps       | ✅ Native                         |
| **Custom Sidebar**         | ✅ Via apps       | ✅ Native                         |
| **Full UI Override**       | ❌ Limited        | ✅ Complete control               |
| **Studio Theming**         | ❌ No             | ✅ Yes                            |
| **Open Source**            | ❌ No             | ✅ Studio is open source          |

**Contentful App Framework:**

- Build custom apps with React
- Locations: entry editor, sidebar, page, app config
- SDK for interacting with Contentful APIs

**Sanity Studio Customization:**

- Override any component via `studio.components`
- Middleware pattern with `renderDefault()`
- Custom document actions, badges, tools

**Documentation:**

- Contentful: [App Framework](https://www.contentful.com/developers/docs/extensibility/app-framework/) | [Marketplace](https://www.contentful.com/marketplace/)
- Sanity: [Studio Plugins](https://www.sanity.io/docs/studio-plugins) | [Custom Components](https://www.sanity.io/docs/intro-to-custom-studio-components) | [Sanity Exchange](https://www.sanity.io/plugins)

---

### Real-Time Collaboration

| Feature                  | Contentful                 | Sanity                        |
| ------------------------ | -------------------------- | ----------------------------- |
| **Simultaneous Editing** | ⚠️ Limited (can overwrite) | ✅ Google Docs-style          |
| **Presence Indicators**  | ❌ No                      | ✅ Yes (avatars, field focus) |
| **Live Preview**         | ✅ Yes                     | ✅ Yes                        |
| **Comments**             | ✅ Yes                     | ✅ Yes (Growth+)              |
| **@Mentions**            | ✅ Yes                     | ✅ Yes                        |
| **Tasks**                | ✅ Tasks App               | ✅ Tasks (Growth+)            |

**Documentation:**

- Contentful: [Live Preview](https://www.contentful.com/help/live-preview/)
- Sanity: [Presence API](https://www.sanity.io/docs/introduction-for-the-presence-api) | [Comments Guide](https://www.sanity.io/guides/use-comments-for-authors-and-editors)

---

### Localization

| Feature                    | Contentful                           | Sanity                 |
| -------------------------- | ------------------------------------ | ---------------------- |
| **Locale Limit (Free)**    | 2                                    | Unlimited              |
| **Locale Limit (Paid)**    | 2 (Lite), Custom (Premium)           | Unlimited              |
| **Field-Level i18n**       | ✅ Yes                               | ✅ Yes (via plugin)    |
| **Document-Level i18n**    | ❌ No                                | ✅ Yes (via plugin)    |
| **Independent Publishing** | ✅ Locale-based publishing (Premium) | ✅ Document-level      |
| **AI Translation**         | ✅ AI Actions                        | ✅ AI Assist (Growth+) |

**Documentation:**

- Contentful: [Localization](https://www.contentful.com/help/localization/) | [AI Actions](https://www.contentful.com/products/ai-actions/)
- Sanity: [Localization Guide](https://www.sanity.io/docs/localization) | [Document Internationalization Plugin](https://github.com/sanity-io/document-internationalization)

---

### AI Features

| Feature                   | Contentful          | Sanity                         |
| ------------------------- | ------------------- | ------------------------------ |
| **AI Product**            | AI Actions          | AI Assist                      |
| **Content Generation**    | ✅ Yes              | ✅ Yes                         |
| **Translation**           | ✅ Bulk translation | ✅ One-click translation       |
| **Image Generation**      | ❌ No               | ✅ Yes                         |
| **Reference Suggestions** | ❌ No               | ✅ Via Embeddings Index        |
| **Custom Instructions**   | ✅ Templates        | ✅ Plain-language instructions |
| **Availability**          | Premium tiers       | Growth+                        |

**Documentation:**

- Contentful: [AI Actions](https://www.contentful.com/help/ai-actions/) | [AI Templates](https://www.contentful.com/help/ai-actions-templates/)
- Sanity: [AI Assist](https://www.sanity.io/docs/ai-assist-working-with-instructions) | [AI Assist Announcement](https://www.sanity.io/blog/sanity-ai-assist-announcement)

---

### Content Agent (Sanity)

Sanity offers **Content Agent**, an AI assistant for working with content across projects without writing code or GROQ queries.

| Feature                      | Description                                       |
| ---------------------------- | ------------------------------------------------- |
| **Natural Language Queries** | Ask questions about your content in plain English |
| **No-Code Operations**       | Query and manipulate content without GROQ         |
| **Cross-Project Support**    | Works across all projects in your organization    |
| **AI Credits**               | Usage-based billing for AI operations             |

**Documentation:**

- Sanity: [Content Agent](https://www.sanity.io/docs/content-agent) | [AI Credits](https://www.sanity.io/docs/content-agent/understanding-ai-credits)

---

### External Data Integration

| Feature                    | Contentful                         | Sanity                                   |
| -------------------------- | ---------------------------------- | ---------------------------------------- |
| **Integration Approach**   | Custom External References         | Sync Plugins + Input Plugins             |
| **Query Language**         | GraphQL (unified delivery)         | GROQ (flexible projections)              |
| **Storage Model**          | Resolved at delivery time          | Can store full documents or references   |
| **Infrastructure**         | Serverless Functions on Contentful | Webhooks + your serverless functions     |
| **Marketplace Connectors** | Shopify, commercetools, Cloudinary | Shopify (Sanity Connect), custom plugins |
| **Availability**           | Premium plans and above            | All plans                                |

**Sanity Integration Patterns:**

| Pattern          | Description                                     | Best For                                         |
| ---------------- | ----------------------------------------------- | ------------------------------------------------ |
| **Sync Plugin**  | Creates Sanity documents for each external item | E-commerce products, inventory sync              |
| **Input Plugin** | Saves external data as field values on-demand   | Immutable references (IDs), simpler integrations |

**Sync Plugin Example (Sanity + Shopify):**

```javascript
// Webhook handler that syncs external products to Sanity documents
async function createOrUpdateProducts(transaction, products) {
  products.forEach((product) => {
    const document = buildProductDocument(product)
    transaction.createIfNotExists(document).patch(document._id, (patch) => patch.set(document))
  })
}
```

**Input Plugin Example (Sanity):**

```javascript
// Using @sanity/sanity-plugin-async-list for on-demand fetching
asyncList({
  schemaType: "externalProduct",
  loader: async () => {
    const response = await fetch("https://api.external-service.com/items")
    const result = await response.json()
    return result.data.map((item) => ({ value: item.id, ...item }))
  },
})
```

**Contentful External References Example:**

```javascript
// Contentful Functions resolve external data at delivery time
// Single GraphQL call returns unified content from Contentful + external sources
```

**Documentation:**

- Contentful: [Custom External References](https://contentful.com/developers/docs/concepts/external-references) | [External References Tutorial](https://contentful.com/developers/docs/extensibility/app-framework/custom-external-references-example-tutorial)
- Sanity: [Integrating External Data](https://www.sanity.io/docs/developer-guides/integrating-external-data) | [Sanity Connect for Shopify](https://www.sanity.io/docs/developer-guides/sanity-connect-for-shopify)

---

### Content Triggers & Webhooks

| Feature                  | Contentful                      | Sanity                                        |
| ------------------------ | ------------------------------- | --------------------------------------------- |
| **Webhook Types**        | Entry, Asset, Content Type      | Document (preferred), Transaction             |
| **Trigger Events**       | Create, Update, Delete, Publish | Create, Update, Delete (published by default) |
| **Filtering**            | Content type, environment       | GROQ filters (full query language)            |
| **Serverless Functions** | Contentful Functions            | Sanity Functions                              |
| **Built-in Client**      | ✅ Yes                          | ✅ Yes (`@sanity/client` with robot token)    |
| **Recursion Protection** | Manual handling                 | ✅ Built-in (16 invocation limit)             |
| **Local Testing**        | Via CLI                         | `sanity functions test` command               |

**Sanity Functions Example:**

```typescript
import { documentEventHandler } from "@sanity/functions"
import { createClient } from "@sanity/client"

export const handler = documentEventHandler(async ({ context, event }) => {
  const client = createClient({
    ...context.clientOptions,
    apiVersion: "2025-05-08",
  })

  // React to content changes: sync to search, notify external services, etc.
  await fetch("https://external-api.com/webhook", {
    method: "POST",
    body: JSON.stringify(event.document),
  })
})
```

**GROQ-Powered Webhook Filtering (Sanity):**

- `delta::` namespace for comparing before/after states
- `before()` / `after()` functions for temporal conditions
- Filter by document type, field values, or complex conditions

**Use Cases:**

- Sync content to search indexes (Algolia, Elasticsearch)
- Trigger external workflows (Slack, email campaigns)
- Update CDN caches on publish
- Two-way sync with external systems
- Create recycling bins for deleted documents

**Documentation:**

- Contentful: [Webhooks](https://www.contentful.com/developers/docs/concepts/webhooks/)
- Sanity: [Webhooks](https://www.sanity.io/docs/http-webhooks) | [Sanity Functions](https://www.sanity.io/docs/compute-and-ai/functions-js-client) | [GROQ Webhook Filters](https://www.sanity.io/docs/developer-guides/filters-in-groq-powered-webhooks)

---

### A/B Testing & Personalization

| Feature                    | Contentful                          | Sanity                                      |
| -------------------------- | ----------------------------------- | ------------------------------------------- |
| **Native A/B Testing**     | ❌ No (via integrations)            | ❌ No (via integrations)                    |
| **Personalization Plugin** | Ninetailed, Optimizely integrations | `@sanity/personalization-plugin`            |
| **GrowthBook Integration** | Via custom implementation           | ✅ Official plugin with field-level support |
| **Experiment Fields**      | Custom field types                  | `experimentString`, `experimentImage`, etc. |
| **Variant Storage**        | Separate entries or custom fields   | Inline variants per field                   |
| **Editor Experience**      | Depends on integration              | Flask icon reveals experiment UI in Studio  |

**Sanity + GrowthBook Architecture:**

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│  Sanity Studio  │────▶│  GrowthBook  │────▶│  Frontend   │
│  (Variations)   │     │  (Targeting) │     │  (Render)   │
└─────────────────┘     └──────────────┘     └─────────────┘
```

**Sanity Schema with Experiments:**

```typescript
// sanity.config.ts
import { fieldLevelExperiments } from "@sanity/personalization-plugin/growthbook"

export default defineConfig({
  plugins: [
    fieldLevelExperiments({
      fields: ["string", "image"],
      environment: "production",
    }),
  ],
})

// Schema definition
defineField({
  name: "title",
  type: "experimentString", // Enables A/B testing on this field
}),
  defineField({
    name: "heroImage",
    type: "experimentImage", // Enables A/B testing on images
  })
```

**GROQ Query with Variant Resolution:**

```groq
*[_type == "product" && slug.current == $slug][0]{
  "title": coalesce(
    title.variants[experimentId == $experiment && variantId == $variant][0].value,
    title.default
  ),
  "image": coalesce(
    image.variants[experimentId == $experiment && variantId == $variant][0].value,
    image.default
  )
}
```

**Documentation:**

- Contentful: [Ninetailed Integration](https://www.contentful.com/marketplace/app/ninetailed-personalization/) | [Optimizely](https://www.contentful.com/marketplace/app/optimizely/)
- Sanity: [GrowthBook + Sanity Guide](https://docs.growthbook.io/guide/sanity) | [A/B Testing with GrowthBook](https://www.sanity.io/docs/developer-guides/a-b-testing-with-sanity-and-growthbook)

---

## Pricing Comparison

### Contentful Pricing (2025-2026)

| Plan        | Cost                  | Key Inclusions                                         |
| ----------- | --------------------- | ------------------------------------------------------ |
| **Free**    | $0                    | 1 space, 100K API calls, 50GB bandwidth, 2 locales     |
| **Lite**    | ~$300/mo              | 1M API calls, 100GB bandwidth, 2 locales               |
| **Premium** | Custom ($33K-$81K/yr) | Unlimited API calls, SSO, custom roles, 10TB bandwidth |

**Overage Costs:**

- API calls: $5 per 1M additional
- Bandwidth: $0.15/GB (Lite), $65/TB (Premium)

**Pricing Page:** [contentful.com/pricing](https://www.contentful.com/pricing/)

---

### Sanity Pricing (2025-2026)

| Plan           | Cost                  | Key Inclusions                                                 |
| -------------- | --------------------- | -------------------------------------------------------------- |
| **Free**       | $0                    | 20 seats, 500K API requests, 20GB bandwidth, unlimited locales |
| **Growth**     | $15/seat/mo           | 50 seats max, 2.5M API requests, 100GB bandwidth               |
| **Enterprise** | Custom ($5K-$10K+/mo) | Custom limits, SSO, dedicated support, SLAs                    |

**Growth Plan Add-ons:**

- SAML SSO: +$1,399/mo
- Dedicated Support: +$799/mo
- Increased Quota: +$299/mo
- Extra Datasets: +$999/mo each

**Pricing Page:** [sanity.io/pricing](https://www.sanity.io/pricing) | [Pricing Calculator](https://www.sanity.io/projects/pricing-calculator)

---

### Cost Comparison Example

**Scenario:** 5 developers, 5 content managers, moderate API usage

| Cost Factor          | Contentful (Lite)  | Sanity (Growth)                    |
| -------------------- | ------------------ | ---------------------------------- |
| Base Cost            | $300/mo            | $150/mo (10 × $15)                 |
| Additional Users     | Included to 20     | $15/seat                           |
| API Overages         | $5/1M calls        | Included in Increased Quota add-on |
| SSO                  | Upgrade to Premium | +$1,399/mo                         |
| **Estimated Annual** | $3,600+            | $1,800+                            |

**Note:** Contentful costs escalate significantly when enterprise features (SSO, custom roles, advanced workflows) are needed. Sanity's per-seat model is more predictable but add-ons can increase costs for larger teams.

---

## Security & Compliance

| Certification     | Contentful   | Sanity          |
| ----------------- | ------------ | --------------- |
| **SOC 2 Type II** | ✅ All plans | ✅ All plans    |
| **GDPR**          | ✅ Yes       | ✅ Yes          |
| **CCPA**          | ✅ Yes       | ✅ All plans    |
| **PCI DSS**       | Premium only | ✅ All plans    |
| **HIPAA**         | Premium only | Enterprise only |
| **ISO 27001**     | ✅ Yes       | ✅ Yes          |

**Documentation:**

- Contentful: [Security & Compliance](https://www.contentful.com/security/)
- Sanity: [Trust Center](https://www.sanity.io/security)

---

## Business Value Considerations

### Common Client Concerns & Responses

| Concern                  | Contentful                                      | Sanity                                                   |
| ------------------------ | ----------------------------------------------- | -------------------------------------------------------- |
| **Vendor Lock-in**       | Content exportable via API                      | One-command export of all documents and assets           |
| **Hidden Costs**         | Predictable but Premium features add up quickly | No server management; transparent pay-as-you-go overages |
| **Talent Availability**  | Requires Contentful-specific knowledge          | JavaScript-based (largest developer talent pool)         |
| **Redesign Flexibility** | May require content restructuring               | Structured content decoupled from presentation           |
| **Multi-team Editing**   | Limited simultaneous editing                    | Deploy multiple Studios for different teams              |

### Sanity-Specific Business Arguments

From [Sanity's client pitch guide](https://www.sanity.io/docs/developer-guides/convincing-your-clients-to-go-with-sanity-io-rather-than-a-traditional-cms):

- **Structured Content ROI**: Single source of truth eliminates copy-paste duplication and inconsistency
- **Rapid Prototyping**: Schema changes in code are instant; demo with client's actual content
- **Future-Proofing**: Content can be reused across web, mobile, IoT without restructuring
- **Team Enablement**: Editors can learn schema basics; changes are version-controlled

---

## Recommendation Matrix

### Choose Contentful If:

- ✅ Non-technical content managers need independence from developers
- ✅ You prefer UI-driven content modeling
- ✅ Out-of-the-box approval workflows are critical
- ✅ You need official native mobile SDKs (iOS/Android)
- ✅ Extensive marketplace integrations are required
- ✅ Traditional CMS editor experience is preferred
- ✅ Unified GraphQL delivery with external data resolution is needed (Premium)
- ✅ You prefer established personalization integrations (Ninetailed, Optimizely)

### Choose Sanity If:

- ✅ Developer experience and flexibility are top priorities
- ✅ Multiple editors need real-time simultaneous collaboration
- ✅ Content schemas should live in version control
- ✅ You need unlimited content types and locales
- ✅ Complex, deeply nested content structures are required
- ✅ Full control over the editorial UI is important
- ✅ Real-time content subscriptions are needed for apps
- ✅ Field-level A/B testing with GrowthBook is desired
- ✅ External data integration is needed on all plans (not just Premium)
- ✅ AI-powered content operations via Content Agent are valuable

---

## Quick Reference Links

### Contentful

| Resource            | URL                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------ |
| Documentation       | [contentful.com/developers/docs](https://www.contentful.com/developers/docs/)                          |
| Case Studies        | [contentful.com/case-studies](https://www.contentful.com/case-studies/)                                |
| Pricing             | [contentful.com/pricing](https://www.contentful.com/pricing/)                                          |
| Marketplace         | [contentful.com/marketplace](https://www.contentful.com/marketplace/)                                  |
| Technical Limits    | [Technical Limits Docs](https://www.contentful.com/developers/docs/technical-limits/)                  |
| Migration CLI       | [Scripting Migrations](https://www.contentful.com/developers/docs/tutorials/cli/scripting-migrations/) |
| External References | [External References](https://contentful.com/developers/docs/concepts/external-references)             |
| Webhooks            | [Webhooks Docs](https://www.contentful.com/developers/docs/concepts/webhooks/)                         |
| App Framework       | [App Framework](https://www.contentful.com/developers/docs/extensibility/app-framework/)               |

### Sanity

| Resource         | URL                                                                                                |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| Documentation    | [sanity.io/docs](https://www.sanity.io/docs)                                                       |
| Case Studies     | [sanity.io/case-studies](https://www.sanity.io/case-studies)                                       |
| Pricing          | [sanity.io/pricing](https://www.sanity.io/pricing)                                                 |
| Plugin Exchange  | [sanity.io/plugins](https://www.sanity.io/plugins)                                                 |
| Technical Limits | [Technical Limits Docs](https://www.sanity.io/docs/technical-limits)                               |
| GROQ Reference   | [GROQ Docs](https://www.sanity.io/docs/groq)                                                       |
| Migration CLI    | [Migration Docs](https://www.sanity.io/docs/schema-and-content-migrations)                         |
| External Data    | [Integrating External Data](https://www.sanity.io/docs/developer-guides/integrating-external-data) |
| Sanity Functions | [Functions Docs](https://www.sanity.io/docs/compute-and-ai/functions-js-client)                    |
| Webhooks         | [Webhooks Docs](https://www.sanity.io/docs/http-webhooks)                                          |
| Content Agent    | [Content Agent Docs](https://www.sanity.io/docs/content-agent)                                     |
| GrowthBook A/B   | [GrowthBook Guide](https://docs.growthbook.io/guide/sanity)                                        |
