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
  PinIcon,
  PresentationIcon,
  UserIcon,
  WrenchIcon,
} from '@sanity/icons'
import type { ComponentType } from 'react'
import { schemaTypes } from './schemas'

// Source unique du mapping doc Sanity <-> URL frontend, partagee avec l'app
// Nuxt (plain TS sans import: resolu par Vite hors racine du Studio).
import {
  buildStudioLocationHref,
  buildStudioMainDocuments,
  legalRouteKeyForId,
  onePagerPath,
  DEFAULT_LOCALE,
  type Locale,
  type WfDocType,
} from '../app/config/route-map'

// CSS overrides du Studio (cache l'onglet « All fields » auto-injecte par Sanity).
import './styles/studio.css'

// Langues supportees par documentInternationalization. Le plugin auto-injecte un
// champ `language` sur chaque doc des I18N_SCHEMA_TYPES et offre un panneau de
// traduction en haut a droite du document.
const SUPPORTED_LANGUAGES = [
  { id: 'fr', title: 'Français' },
  { id: 'en', title: 'English' },
]

// TOUS les documents sont localises (peau Ancree: villes/serviceCity au lieu de
// projets; pas de type project).
const I18N_SCHEMA_TYPES = [
  'siteSettings', 'homePage', 'servicesPage', 'villesPage', 'aboutPage',
  'blogPage', 'faqPage', 'contactPage', 'onePager',
  'service', 'serviceCity', 'article', 'category',
  'testimonial', 'faqItem', 'faqTheme', 'legalPage',
]

const SINGLETON_TYPES = new Set([
  'siteSettings', 'homePage', 'servicesPage', 'villesPage', 'aboutPage',
  'blogPage', 'faqPage', 'contactPage', 'onePager',
])

// Instances fixes creees par le seed (ids deterministes), pas de creation libre.
const FIXED_INSTANCE_TYPES = new Set(['legalPage'])

// Actions conservees sur les singletons ET les instances fixes (legalPage):
// garde les 2 actions du plugin i18n, retire Duplicate et Delete.
const SINGLETON_ACTIONS = new Set([
  'publish', 'discardChanges', 'restore',
  'createTranslationAction', 'translationsAction',
])

// Types ranges manuellement dans la structure, exclus de l'auto-listing.
const NESTED_TYPES = new Set([
  'service', 'serviceCity', 'article', 'category',
  'testimonial', 'faqItem', 'faqTheme', 'legalPage',
])

// URL de l'app Nuxt visee par le presentationTool (iframe live).
// Override via SANITY_STUDIO_PREVIEW_URL pour un autre environnement.
const PREVIEW_ORIGIN = process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:3000'

// Helper singleton: le doc FR est la porte d'entree, le switch FR/EN passe par
// le panneau Translations du plugin (en haut a droite du doc).
const singleton = (S: StructureBuilder, id: string, title: string, icon: ComponentType) =>
  S.listItem()
    .title(title)
    .id(id)
    .icon(icon)
    .child(S.document().schemaType(id).documentId(`${id}-fr`).title(title))

// Helper collection: toutes les listes de collections sont filtrees
// language == "fr" avec tri par defaut. Un seul document par item affiche (la
// version FR), la bascule FR/EN se fait DANS le document via le selecteur de
// langue du plugin documentInternationalization.
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

// Title affiche dans le panneau « Documents on this page » quand le champ title
// selectionne est vide (singletons sans hero.title, doc en creation).
const LOCATION_TITLE_FALLBACKS: Record<WfDocType, string> = {
  homePage: 'Accueil',
  servicesPage: 'Services',
  villesPage: 'Villes',
  aboutPage: 'À propos',
  blogPage: 'Blogue',
  faqPage: 'FAQ',
  contactPage: 'Contact',
  onePager: 'One-Pager',
  service: 'Service',
  serviceCity: 'Ville',
  article: 'Article',
  category: 'Catégorie',
  legalPage: 'Page légale',
}

// Singletons de page: le titre humain vit dans hero.title. Les types de
// collection ont un title (ou city pour serviceCity) racine.
const HERO_TITLE_TYPES = new Set<WfDocType>([
  'homePage', 'servicesPage', 'villesPage', 'aboutPage',
  'blogPage', 'faqPage', 'contactPage', 'onePager',
])

const SLUG_TYPES = new Set<WfDocType>(['service', 'serviceCity', 'article', 'category'])

/**
 * Genere la config `locations` du presentationTool: une boucle defineLocations
 * par doc-type routable, qui delegue l'URL a buildStudioLocationHref (un seul
 * switch lang/slug/catSlug dans le route-map). legalPage: routee par _id
 * deterministe du seed, avec sa vue one-pager en second emplacement.
 */
const buildLocationsConfig = () => {
  const locations: Record<string, ReturnType<typeof defineLocations>> = {}

  for (const docType of Object.keys(LOCATION_TITLE_FALLBACKS) as WfDocType[]) {
    const select: Record<string, string> = {
      title: HERO_TITLE_TYPES.has(docType) ? 'hero.title' : 'title',
      language: 'language',
    }
    if (SLUG_TYPES.has(docType)) select.slug = 'slug.current'
    if (docType === 'serviceCity') select.title = 'city'
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

        // Vue one-pager des pages legales (palier 1): meme document, second
        // emplacement. Releve des locations, pas des mainDocuments.
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

// Desk structure: ordre de navigation du site, pas ordre des types. Groupe
// « Villes » a la place de « Projets » (les services par ville sont le moteur
// SEO local d'Ancree; aucun type project).
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

      S.listItem().title('Villes').icon(PinIcon).child(
        S.list().title('Villes').items([
          singleton(S, 'villesPage', 'Page Villes', PinIcon),
          S.divider(),
          collection(S, 'serviceCity', 'Villes (collection)', [{ field: 'order', direction: 'asc' }]),
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

      // Section demarquee: le palier 1 vit a part, apres tout le multipage.
      singleton(S, 'onePager', 'One-Pager (palier 1)', PresentationIcon),
      S.divider(),

      // Auto-listing de securite: tout nouveau type oublie apparait quand meme.
      // media.tag (type du plugin sanity-plugin-media) est exclu: il se gere par
      // l'onglet Media, pas par le desk.
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
    // `language` (auto-injecte, hidden) et un panneau Translations avec bouton
    // de creation de traduction. Le plugin cree des docs `translation.metadata`
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
        // mainDocuments: mapping inverse URL -> doc, genere depuis le route-map
        // partage. Quand l'editeur navigue dans l'iframe, le Studio matche le
        // path contre ces patterns et peuple « Documents on this page ».
        mainDocuments: defineDocuments(buildStudioMainDocuments()),
        // locations: doc -> URL(s) publiques, ou amener l'iframe au clic sur
        // « Open preview ». Tout derive de buildStudioLocationHref.
        locations: buildLocationsConfig(),
      },
    }),

    // Media library: onglet « Media » en haut du Studio (browser/tagger global).
    // Locales FR/EN: le texte alternatif (altText) devient BILINGUE sur l'asset
    // ({ fr, en }), saisi une fois par image dans la médiathèque. Le front lit la
    // bonne langue (FIGURE_PROJECTION via $language). Plus de champ alt par usage.
    media({
      locales: [
        { id: 'fr', title: 'Français' },
        { id: 'en', title: 'English' },
      ],
    }),

    visionTool(),

    // Studio en francais (libelles du shell, dont « Add item » des arrays).
    frFRLocale(),
  ],

  schema: {
    types: schemaTypes,
    // Creation en FR seulement; singletons, instances fixes et media.tag exclus
    // du bouton +.
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
    // Meme jeu d'actions pour les singletons ET les instances fixes (legalPage):
    // pas de Duplicate (id aleatoire orphelin du route-map) ni de Delete, pour
    // preserver l'invariant « exactement 2 instances par langue » de legalPage.
    actions: (input, context) =>
      SINGLETON_TYPES.has(context.schemaType) || FIXED_INSTANCE_TYPES.has(context.schemaType)
        ? input.filter(({ action }) => action && SINGLETON_ACTIONS.has(action))
        : input,
  },

  form: {
    // Retire le picker du plugin media des champs image (l'onglet Media reste).
    image: { assetSources: (prev) => prev.filter((s) => s.name !== 'media') },
    file: { assetSources: (prev) => prev.filter((s) => s.name !== 'media') },
  },
})
