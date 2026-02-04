import {defineMigration, at, set, patch} from 'sanity/migrate'

// Valid property types from the schema
const validPropertyTypes = [
  'Single family',
  'Townhome',
  'Duplex',
  'Patio home',
  'Multifamily',
  'MultiGen',
]

export default defineMigration({
  title: 'Clean up duplicated property type values',
  documentTypes: ['community'],

  async *migrate(documents) {
    for await (const doc of documents()) {
      const propertyType = doc.propertyType as string | undefined

      if (propertyType && propertyType.includes(';')) {
        // Extract the first valid value before the semicolon
        const cleanedValue = propertyType.split(';')[0].trim()

        // Verify it's a valid option
        if (validPropertyTypes.includes(cleanedValue)) {
          yield patch(doc._id, [at('propertyType', set(cleanedValue))])
        }
      }
    }
  },
})
