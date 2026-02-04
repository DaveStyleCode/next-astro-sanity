/**
 * Migration to publish draft documents.
 *
 * Usage:
 *   # Publish all drafts
 *   npx sanity migration run publish-drafts --no-dry-run
 *
 *   # Publish only specific types (pass as comma-separated via env var)
 *   TYPES=community,house npx sanity migration run publish-drafts --no-dry-run
 *
 *   # Dry run to preview
 *   TYPES=community npx sanity migration run publish-drafts
 */

import {defineMigration, createOrReplace, del, transaction} from 'sanity/migrate'
import type {SanityDocument} from 'sanity'

// Get types from environment variable (comma-separated)
const typesEnv = process.env.TYPES
const targetTypes = typesEnv ? typesEnv.split(',').map((t) => t.trim()) : null

export default defineMigration({
  title: targetTypes
    ? `Publish draft documents (types: ${targetTypes.join(', ')})`
    : 'Publish all draft documents',

  async *migrate(documents, context) {
    // Query for all drafts, optionally filtered by type
    const filter = targetTypes ? `_id match "drafts.*" && _type in $types` : `_id match "drafts.*"`

    const params = targetTypes ? {types: targetTypes} : {}

    const drafts = await context.client.fetch<
      Array<{_id: string; _type: string; [key: string]: unknown}>
    >(`*[${filter}]`, params)

    console.log(
      `Found ${drafts.length} drafts to publish${targetTypes ? ` (types: ${targetTypes.join(', ')})` : ''}`,
    )

    for (const draft of drafts) {
      // Skip system documents
      if (draft._type.startsWith('sanity.')) {
        continue
      }

      // Get the published ID (remove "drafts." prefix)
      const publishedId = draft._id.replace(/^drafts\./, '')

      // Create the published document (copy all fields, change _id)
      const publishedDoc: Record<string, unknown> = {
        ...draft,
        _id: publishedId,
      }

      // Remove system fields that shouldn't be copied
      delete publishedDoc._rev
      delete publishedDoc._system

      // Use transaction() for atomicity - both operations succeed or fail together
      yield transaction([createOrReplace(publishedDoc as SanityDocument), del(draft._id)])

      console.log(`Published: ${draft._id} -> ${publishedId}`)
    }
  },
})
