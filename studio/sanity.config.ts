import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {structure, defaultDocumentNode} from './deskStructure'

export default defineConfig({
  name: 'default',
  title: 'Horton',

  projectId: '9mua1ulx',
  dataset: 'production',

  plugins: [
    structureTool({
      structure,
      defaultDocumentNode,
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },

  vite: {
    resolve: {
      dedupe: ['styled-components'],
    },
  },
})
