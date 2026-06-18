import { defineConfig } from 'sanity'
import { structureTool, type StructureBuilder } from 'sanity/structure'
import { presentationTool, defineDocuments, defineLocations } from 'sanity/presentation'
import { visionTool } from '@sanity/vision'
import { documentInternationalization } from '@sanity/document-internationalization'
import { frFRLocale } from '@sanity/locale-fr-fr'
import { media } from 'sanity-plugin-media'
import {
  BookIcon,
  CogIcon,
  DatabaseIcon,
  EnvelopeIcon,
  HelpCircleIcon,
  HomeIcon,
  PresentationIcon,
  ProjectsIcon,
  UserIcon,
  WrenchIcon,
} from '@sanity/icons'
import type { ComponentType } from 'react'
import { schemaTypes } from './schemas'

// Source unique du mapping doc Sanity <-> URL frontend, partagée avec l'app
// Nuxt (plain TS sans import: résolu par Vite hors racine du Studio, pattern
// prouvé dans la référence nuxt-sanity-test).
import {
  buildStudioLocationHref,
  buildStudioMainDocuments,
  legalRouteKeyForId,
  onePagerPath,
  DEFAULT_LOCALE,
  type Locale,
  type WfDocType,
} from '../app/config/route-map'

// CSS overrides du Studio (cache l'onglet « All fields » auto-injecté par Sanity).
// Vite résout l'import et injecte le CSS globalement.
import './styles/studio.css'

// Langues supportées par documentInternationalization. Le plugin auto-injecte
// un champ `language` sur chaque doc des I18N_SCHEMA_TYPES et offre un panneau
// de traduction en haut à droite du doc.
const SUPPORTED_LANGUAGES = [
  { id: 'fr', title: 'Français' },
  { id: 'en', title: 'English' },
]

// TOUS les documents sont localisés.
const I18N_SCHEMA_TYPES = [
  'siteSettings', 'homePage', 'servicesPage', 'projectsPage', 'aboutPage',
  'blogPage', 'faqPage', 'contactPage', 'onePager',
  'service', 'project', 'article', 'category',
  'testimonial', 'faqItem', 'faqTheme', 'legalPage',
]

const SINGLETON_TYPES = new Set([
  'siteSettings', 'homePage', 'servicesPage', 'projectsPage', 'aboutPage',
  'blogPage', 'faqPage', 'contactPage', 'onePager',
])

// Instances fixes créées par le seed (ids déterministes), pas de création libre.
const FIXED_INSTANCE_TYPES = new Set(['legalPage'])

// Actions conservées sur les singletons ET les instances fixes (legalPage):
// garde les 2 actions du plugin i18n, retire Duplicate et Delete.
const SINGLETON_ACTIONS = new Set([
  'publish', 'discardChanges', 'restore',
  'createTranslationAction', 'translationsAction',
])

// Types rangés manuellement dans la structure, exclus de l'auto-listing.
const NESTED_TYPES = new Set([
  'service', 'project', 'article', 'category',
  'testimonial', 'faqItem', 'faqTheme', 'legalPage',
])

// URL de l'app Nuxt visée par le presentationTool (iframe live).
// Override via SANITY_STUDIO_PREVIEW_URL pour un autre environnement.
const PREVIEW_ORIGIN = process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:3000'

// Helper singleton: le doc FR est la porte d'entrée, le switch FR/EN passe par
// le panneau Translations du plugin (en haut à droite du doc).
const singleton = (S: StructureBuilder, id: string, title: string, icon: ComponentType) =>
  S.listItem()
    .title(title)
    .id(id)
    .icon(icon)
    .child(S.document().schemaType(id).documentId(`${id}-fr`).title(title))

// Helper collection: toutes les listes de collections sont filtrées
// language == "fr" avec tri par défaut. Un seul document par item affiché
// (la version FR), la bascule FR/EN se fait DANS le document via le sélecteur
// de langue du plugin documentInternationalization.
const collection = (
  S: StructureBuilder,
  type: string,
  title: string,
  by: { field: string; direction: 'asc' | 'desc' }[],
) =>
  S.documentTypeListItem(type)
    .title(title)
    .child(
      S.documentList()
        .title(title)
        .schemaType(type)
        .filter('_type == $type && language == "fr"')
        .params({ type })
        .defaultOrdering(by),
    )

// ── Presentation tool: resolvers doc -> URL (locations) ──────────────────────

// Title affiché dans le panneau « Documents on this page » quand le champ
// title sélectionné est vide (singletons sans hero.title, doc en création).
const LOCATION_TITLE_FALLBACKS: Record<WfDocType, string> = {
  homePage: 'Accueil',
  servicesPage: 'Services',
  projectsPage: 'Projets',
  aboutPage: 'À propos',
  blogPage: 'Blogue',
  faqPage: 'FAQ',
  contactPage: 'Contact',
  onePager: 'One-Pager',
  service: 'Service',
  project: 'Projet',
  article: 'Article',
  category: 'Catégorie',
  legalPage: 'Page légale',
}

// Singletons de page: le titre humain vit dans hero.title (pas de champ title
// racine au schéma). Les types de collection ont un title racine.
const HERO_TITLE_TYPES = new Set<WfDocType>([
  'homePage', 'servicesPage', 'projectsPage', 'aboutPage',
  'blogPage', 'faqPage', 'contactPage', 'onePager',
])

const SLUG_TYPES = new Set<WfDocType>(['service', 'project', 'article', 'category'])

/**
 * Génère la config `locations` du presentationTool: une boucle defineLocations
 * par doc-type routable, qui délègue l'URL à buildStudioLocationHref (un seul
 * switch lang/slug/catSlug dans le route-map, au lieu de 13 resolvers manuels).
 * legalPage: routée par _id déterministe du seed, avec sa vue one-pager en
 * second emplacement (mêmes documents servis aux deux endroits).
 */
const buildLocationsConfig = () => {
  const locations: Record<string, ReturnType<typeof defineLocations>> = {}

  for (const docType of Object.keys(LOCATION_TITLE_FALLBACKS) as WfDocType[]) {
    const select: Record<string, string> = {
      title: HERO_TITLE_TYPES.has(docType) ? 'hero.title' : 'title',
      language: 'language',
    }
    if (SLUG_TYPES.has(docType)) select.slug = 'slug.current'
    if (docType === 'article') select.catSlug = 'category->slug.current'
    if (docType === 'legalPage') select.id = '_id'

    locations[docType] = defineLocations({
      select,
      resolve: (doc) => {
        const language = doc?.language as Locale | undefined
        const href = buildStudioLocationHref(docType, {
          _id: doc?.id as string | undefined,
          language,
          slug: doc?.slug as string | undefined,
          catSlug: doc?.catSlug as string | undefined,
        })
        if (!href) return { locations: [] }

        const title = (doc?.title as string) || LOCATION_TITLE_FALLBACKS[docType]
        const entries = [{ title, href }]

        // Vue one-pager des pages légales (palier 1): même document, second
        // emplacement. Relève des locations, pas des mainDocuments (cf. route-map).
        if (docType === 'legalPage' && typeof doc?.id === 'string') {
          const key = legalRouteKeyForId(doc.id)
          if (key) {
            entries.push({
              title: `${title} (one-pager)`,
              href: onePagerPath(key, language ?? DEFAULT_LOCALE),
            })
          }
        }

        return { locations: entries }
      },
    })
  }

  return locations
}

// Desk structure: ordre de navigation du site, pas ordre des types.
const structure = (S: StructureBuilder) =>
  S.list()
    .title('Contenu')
    .items([
      singleton(S, 'siteSettings', 'Globales', CogIcon),
      S.divider(),

      singleton(S, 'homePage', 'Accueil', HomeIcon),

      S.listItem().title('Services').icon(WrenchIcon).child(
        S.list().title('Services').items([
          singleton(S, 'servicesPage', 'Page Services', WrenchIcon),
          S.divider(),
          collection(S, 'service', 'Services (collection)', [{ field: 'order', direction: 'asc' }]),
        ]),
      ),

      S.listItem().title('Projets').icon(ProjectsIcon).child(
        S.list().title('Projets').items([
          singleton(S, 'projectsPage', 'Page Projets', ProjectsIcon),
          S.divider(),
          collection(S, 'project', 'Projets (collection)', [{ field: 'order', direction: 'asc' }]),
        ]),
      ),

      S.listItem().title('Blogue').icon(BookIcon).child(
        S.list().title('Blogue').items([
          singleton(S, 'blogPage', 'Page Blogue', BookIcon),
          S.divider(),
          collection(S, 'article', 'Articles', [{ field: 'date', direction: 'desc' }]),
          collection(S, 'category', 'Catégories', [{ field: 'order', direction: 'asc' }]),
        ]),
      ),

      singleton(S, 'aboutPage', 'À propos', UserIcon),

      S.listItem().title('FAQ').icon(HelpCircleIcon).child(
        S.list().title('FAQ').items([
          singleton(S, 'faqPage', 'Page FAQ', HelpCircleIcon),
          S.divider(),
          collection(S, 'faqItem', 'Banque de questions', [{ field: 'question', direction: 'asc' }]),
          collection(S, 'faqTheme', 'Thèmes', [{ field: 'title', direction: 'asc' }]),
        ]),
      ),

      singleton(S, 'contactPage', 'Contact', EnvelopeIcon),
      S.divider(),

      S.listItem().title('Banques').icon(DatabaseIcon).child(
        S.list().title('Banques').items([
          collection(S, 'testimonial', 'Témoignages', [{ field: 'order', direction: 'asc' }]),
        ]),
      ),
      collection(S, 'legalPage', 'Pages légales', [{ field: 'title', direction: 'asc' }]),
      S.divider(),

      // Section démarquée: le palier 1 vit à part, après tout le multipage.
      singleton(S, 'onePager', 'One-Pager (palier 1)', PresentationIcon),
      S.divider(),

      // Auto-listing de sécurité: tout nouveau type oublié apparaît quand même.
      // media.tag (type document du plugin sanity-plugin-media) est exclu: il se
      // gère par l'onglet Media, pas par le desk (trou présent dans la référence,
      // corrigé ici).
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId()
        return (
          !!id &&
          !SINGLETON_TYPES.has(id) &&
          !NESTED_TYPES.has(id) &&
          id !== 'translation.metadata' &&
          id !== 'media.tag'
        )
      }),
    ])

export default defineConfig({
  name: 'default',
  title: 'WebForge - Ancrée',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || '5if00rwn',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',

  plugins: [
    structureTool({ structure }),

    // Document-level i18n: chaque doc des I18N_SCHEMA_TYPES gagne un champ
    // `language` (auto-injecté, hidden) et un panneau Translations avec bouton
    // de création de traduction. Le plugin crée des docs `translation.metadata`
    // qui relient les versions par langue.
    documentInternationalization({
      supportedLanguages: SUPPORTED_LANGUAGES,
      schemaTypes: I18N_SCHEMA_TYPES,
    }),

    presentationTool({
      previewUrl: {
        initial: PREVIEW_ORIGIN,
        previewMode: { enable: '/preview/enable' },
      },
      resolve: {
        // mainDocuments: mapping inverse URL -> doc, généré depuis le route-map
        // partagé. Quand l'éditeur navigue dans l'iframe (clic de lien), le
        // Studio matche le path contre ces patterns et peuple le panneau
        // « Documents on this page ». Ordre: type x langue (FR sans préfixe,
        // EN sous /en), patterns spécifiques d'abord, /blog/:slug ambigu en
        // dernier (catégorie avant article sans catégorie); legalPage par _id.
        mainDocuments: defineDocuments(buildStudioMainDocuments()),
        // locations: doc -> URL(s) publiques, où amener l'iframe au clic sur
        // « Open preview ». Tout dérive de buildStudioLocationHref.
        locations: buildLocationsConfig(),
      },
    }),

    // Media library: onglet « Media » en haut du Studio (browser/tagger global
    // de tous les assets uploadés).
    media(),

    visionTool(),

    // Studio en français (libellés du shell, dont le bouton « Add item » des
    // arrays). Package @sanity/locale-fr-fr, déjà installé.
    frFRLocale(),
  ],

  schema: {
    types: schemaTypes,
    // Création en FR seulement; singletons, instances fixes et media.tag (plugin
    // sanity-plugin-media) exclus du bouton +.
    templates: (templates) =>
      templates.filter((template) => {
        if (SINGLETON_TYPES.has(template.schemaType)) return false
        if (FIXED_INSTANCE_TYPES.has(template.schemaType)) return false
        if (template.schemaType === 'media.tag') return false
        if (I18N_SCHEMA_TYPES.includes(template.schemaType)) {
          return template.id === `${template.schemaType}-fr`
        }
        return true
      }),
  },

  document: {
    // Même jeu d'actions pour les singletons ET les instances fixes (legalPage):
    // pas de Duplicate (id aléatoire orphelin du route-map) ni de Delete, pour
    // préserver l'invariant « exactement 2 instances par langue » de legalPage.
    actions: (input, context) =>
      SINGLETON_TYPES.has(context.schemaType) || FIXED_INSTANCE_TYPES.has(context.schemaType)
        ? input.filter(({ action }) => action && SINGLETON_ACTIONS.has(action))
        : input,
  },

  form: {
    // Retire le picker du plugin media des champs image (l'onglet Media global reste).
    image: { assetSources: (prev) => prev.filter((s) => s.name !== 'media') },
    // Symétrie littérale avec la référence, qui filtre aussi les champs file.
    // Aucun champ file au schéma du démo: sans effet aujourd'hui, mais le calque
    // reste complet si un champ file apparaît un jour.
    file: { assetSources: (prev) => prev.filter((s) => s.name !== 'media') },
  },
})
