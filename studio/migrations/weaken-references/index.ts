/**
 * Migration to convert strong references to weak references.
 *
 * This fixes documents that were published before their reference fields
 * were changed to weak: true in the schema.
 *
 * Affected fields (all have weak: true in schema):
 *   - community.stateRef -> state
 *   - community.areaRef -> areas
 *   - house.communityRef -> community
 *   - house.floorPlanRef -> floorPlan
 *   - floorPlan.communityRef -> community
 *   - areas.stateRef -> state
 *
 * Usage:
 *   # Dry run to preview changes
 *   npx sanity migration run weaken-references
 *
 *   # Apply changes
 *   npx sanity migration run weaken-references --no-dry-run
 */

import {defineMigration, at, set, patch} from 'sanity/migrate'

type RefField = {_ref?: string; _weak?: boolean; _type?: string} | undefined

export default defineMigration({
  title: 'Convert strong references to weak references',
  documentTypes: ['floorPlan', 'house', 'community', 'areas'],

  async *migrate(documents) {
    for await (const doc of documents()) {
      const patches: ReturnType<typeof at>[] = []

      /**
       * Helper to create a patch for a reference field if it needs weakening.
       * A reference needs weakening if it exists and doesn't have _weak: true.
       */
      const weakenRef = (fieldName: string, ref: RefField) => {
        if (ref?._ref && !ref._weak) {
          patches.push(
            at(
              fieldName,
              set({
                _type: 'reference',
                _ref: ref._ref,
                _weak: true,
              }),
            ),
          )
        }
      }

      // Handle floorPlan documents
      if (doc._type === 'floorPlan') {
        weakenRef('communityRef', doc.communityRef as RefField)
      }

      // Handle house documents
      if (doc._type === 'house') {
        weakenRef('communityRef', doc.communityRef as RefField)
        weakenRef('floorPlanRef', doc.floorPlanRef as RefField)
      }

      // Handle community documents
      if (doc._type === 'community') {
        weakenRef('stateRef', doc.stateRef as RefField)
        weakenRef('areaRef', doc.areaRef as RefField)
      }

      // Handle areas documents
      if (doc._type === 'areas') {
        weakenRef('stateRef', doc.stateRef as RefField)
      }

      if (patches.length > 0) {
        yield patch(doc._id, patches)
      }
    }
  },
})
