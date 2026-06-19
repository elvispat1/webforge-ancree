import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { media } from 'sanity-plugin-media'
import { frFRLocale } from '@sanity/locale-fr-fr'

import { schemaTypes } from './schemas'
import './styles/studio.css'

// CANVAS VIERGE: Studio minimal d'Ancrée. L'architecture de contenu (schémas,
// internationalisation des documents, presentation tool / preview) est repartie
// de zéro et sera rebâtie. Identité conservée (project 5if00rwn, Studio
// webforge-ancree). Schémas vides pour l'instant (studio/schemas/index.ts).
export default defineConfig({
  name: 'default',
  title: 'WebForge - Ancrée',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || '5if00rwn',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',

  plugins: [
    structureTool(),
    media(),
    visionTool(),
    // Studio en français (libellés du shell).
    frFRLocale(),
  ],

  schema: {
    types: schemaTypes,
  },
})
