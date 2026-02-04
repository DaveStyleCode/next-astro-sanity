import {defineMigration, at, set, patch} from 'sanity/migrate'

function toTitleCase(str: string): string {
  return str.replace(/\b\w/g, (char) => char.toUpperCase())
}

export default defineMigration({
  title: 'Capitalize state names',
  documentTypes: ['state'],

  async *migrate(documents) {
    for await (const doc of documents()) {
      const name = doc.name as string | undefined

      if (name && name !== toTitleCase(name)) {
        yield patch(doc._id, [at('name', set(toTitleCase(name)))])
      }
    }
  },
})
