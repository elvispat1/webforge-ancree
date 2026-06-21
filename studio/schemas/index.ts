/* Architecture de contenu Ancree (demo Rempart Extermination).
 *
 * Internationalisation au niveau DOCUMENT: chaque document localise porte un
 * champ `language` ('fr' | 'en'). Les singletons ont un id fixe par langue
 * (homePage.fr / homePage.en, siteSettings.fr / siteSettings.en). Les collections
 * (service, serviceCity, testimonial, faqItem) ont un document par langue,
 * partageant un meme `slug`. Le front filtre par `language == $locale`.
 *
 * Modele « donnees, pas presentation ». Le type « projet » est remplace par
 * `serviceCity` (services par ville, moteur SEO local). Les images sont stockees
 * en URL (chemins publics) pour la demo; un vrai client televerserait des assets.
 * Aucune numerotation nulle part. */
import { defineType, defineField, defineArrayMember, type SchemaTypeDefinition } from 'sanity'
import {
  HomeIcon,
  CogIcon,
  BugIcon,
  PinIcon,
  CommentIcon,
  HelpCircleIcon,
  BlockContentIcon,
  StarIcon,
  ImageIcon,
  UsersIcon,
  CheckmarkCircleIcon,
  PhoneIcon,
  DocumentTextIcon,
  TagIcon,
  ImagesIcon,
  BulbOutlineIcon
} from '@sanity/icons'

/* Champ langue partage, ajoute a chaque document localise. */
const languageField = defineField({
  name: 'language',
  title: 'Langue',
  type: 'string',
  options: {
    list: [
      { title: 'Francais', value: 'fr' },
      { title: 'English', value: 'en' }
    ],
    layout: 'radio'
  },
  initialValue: 'fr',
  validation: (rule) => rule.required()
})

/* ---------- Objets partages ---------- */

const figure = defineType({
  name: 'figure',
  title: 'Image',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({ name: 'src', title: 'URL de l’image', type: 'string' }),
    defineField({ name: 'alt', title: 'Texte alternatif', type: 'string', description: 'Toujours present; vide = decorative.' })
  ]
})

const link = defineType({
  name: 'link',
  title: 'Lien',
  type: 'object',
  fields: [
    defineField({ name: 'label', title: 'Libelle', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'href', title: 'Destination', type: 'string', description: 'Route (/services), ancre (#contact) ou tel:/mailto:.', validation: (r) => r.required() })
  ]
})

const proof = defineType({
  name: 'proof',
  title: 'Preuve de confiance',
  type: 'object',
  fields: [
    defineField({ name: 'icon', title: 'Icone (Iconify lucide)', type: 'string' }),
    defineField({ name: 'value', title: 'Valeur', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'label', title: 'Qualificatif', type: 'string' })
  ]
})

const stat = defineType({
  name: 'stat',
  title: 'Chiffre de confiance',
  type: 'object',
  fields: [
    defineField({ name: 'value', title: 'Valeur', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'label', title: 'Libelle', type: 'string' })
  ]
})

/* ---------- Heros ---------- */

const heroHome = defineType({
  name: 'heroHome',
  title: 'Heros (split full bleed)',
  type: 'object',
  icon: HomeIcon,
  fields: [
    defineField({ name: 'kicker', title: 'Pastille d’ancrage', type: 'string' }),
    defineField({ name: 'title', title: 'Titre', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'lead', title: 'Accroche', type: 'text', rows: 3, validation: (r) => r.required() }),
    defineField({ name: 'primaryCta', title: 'Bouton d’appel', type: 'link' }),
    defineField({ name: 'secondaryCta', title: 'Bouton secondaire', type: 'link' }),
    defineField({ name: 'meta', title: 'Preuves integrees', type: 'array', of: [defineArrayMember({ type: 'proof' })], validation: (r) => r.max(3) }),
    defineField({ name: 'visual', title: 'Image', type: 'figure' })
  ]
})

/* ---------- Blocs de la page-builder (objets) ---------- */

const trustBarBlock = defineType({
  name: 'trustBar',
  title: 'Barre de confiance',
  type: 'object',
  icon: CheckmarkCircleIcon,
  fields: [
    defineField({ name: 'items', title: 'Signaux', type: 'array', of: [defineArrayMember({ type: 'proof' })], validation: (r) => r.min(2).max(4) })
  ],
  preview: { prepare: () => ({ title: 'Barre de confiance' }) }
})

const servicesBlock = defineType({
  name: 'servicesBlock',
  title: 'Services',
  type: 'object',
  icon: BugIcon,
  fields: [
    defineField({ name: 'eyebrow', title: 'Sur-titre', type: 'string' }),
    defineField({ name: 'heading', title: 'Titre', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'lead', title: 'Accroche', type: 'text', rows: 2 }),
    defineField({ name: 'ctaLabel', title: 'Libelle du CTA', type: 'string' }),
    defineField({ name: 'ctaHref', title: 'Lien du CTA', type: 'string' })
  ],
  preview: { select: { title: 'heading' }, prepare: ({ title }) => ({ title: title || 'Services', subtitle: 'Services (puise dans la collection)' }) }
})

const serviceCitiesBlock = defineType({
  name: 'serviceCitiesBlock',
  title: 'Services par ville',
  type: 'object',
  icon: PinIcon,
  fields: [
    defineField({ name: 'eyebrow', title: 'Sur-titre', type: 'string' }),
    defineField({ name: 'heading', title: 'Titre', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'lead', title: 'Accroche', type: 'text', rows: 2 }),
    defineField({ name: 'areaLabel', title: 'Libelle de la zone', type: 'string' }),
    defineField({ name: 'areaName', title: 'Nom de la zone', type: 'string' }),
    defineField({ name: 'areaNote', title: 'Note de zone', type: 'text', rows: 2 })
  ],
  preview: { select: { title: 'heading' }, prepare: ({ title }) => ({ title: title || 'Services par ville', subtitle: 'Villes (puise dans la collection)' }) }
})

const aboutBlock = defineType({
  name: 'aboutBlock',
  title: 'A propos',
  type: 'object',
  icon: UsersIcon,
  fields: [
    defineField({ name: 'eyebrow', title: 'Sur-titre', type: 'string' }),
    defineField({ name: 'heading', title: 'Titre', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'body', title: 'Paragraphes', type: 'array', of: [defineArrayMember({ type: 'text' })] }),
    defineField({ name: 'photo', title: 'Photo d’equipe', type: 'figure' }),
    defineField({ name: 'stats', title: 'Chiffres de confiance', type: 'array', of: [defineArrayMember({ type: 'stat' })], validation: (r) => r.max(4) })
  ],
  preview: { select: { title: 'heading' }, prepare: ({ title }) => ({ title: title || 'A propos', subtitle: 'A propos' }) }
})

const testimonialsBlock = defineType({
  name: 'testimonialsBlock',
  title: 'Temoignages',
  type: 'object',
  icon: StarIcon,
  fields: [
    defineField({ name: 'eyebrow', title: 'Sur-titre', type: 'string' }),
    defineField({ name: 'heading', title: 'Titre', type: 'string', validation: (r) => r.required() })
  ],
  preview: { select: { title: 'heading' }, prepare: ({ title }) => ({ title: title || 'Temoignages', subtitle: 'Temoignages (puise dans la collection)' }) }
})

const faqBlock = defineType({
  name: 'faqBlock',
  title: 'FAQ',
  type: 'object',
  icon: HelpCircleIcon,
  fields: [
    defineField({ name: 'eyebrow', title: 'Sur-titre', type: 'string' }),
    defineField({ name: 'heading', title: 'Titre', type: 'string', validation: (r) => r.required() })
  ],
  preview: { select: { title: 'heading' }, prepare: ({ title }) => ({ title: title || 'FAQ', subtitle: 'FAQ (puise dans la collection)' }) }
})

const ctaBandBlock = defineType({
  name: 'ctaBand',
  title: 'Bandeau d’appel',
  type: 'object',
  icon: PhoneIcon,
  fields: [
    defineField({ name: 'title', title: 'Titre', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'subtitle', title: 'Sous-titre', type: 'text', rows: 2 }),
    defineField({ name: 'primaryCta', title: 'Bouton d’appel', type: 'link' }),
    defineField({ name: 'secondaryCta', title: 'Bouton secondaire', type: 'link' })
  ],
  preview: { select: { title: 'title' }, prepare: ({ title }) => ({ title: title || 'Bandeau d’appel', subtitle: 'Bandeau d’appel' }) }
})

const contactBlock = defineType({
  name: 'contactBlock',
  title: 'Contact',
  type: 'object',
  icon: CommentIcon,
  fields: [
    defineField({ name: 'eyebrow', title: 'Sur-titre', type: 'string' }),
    defineField({ name: 'heading', title: 'Titre', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'lead', title: 'Accroche', type: 'text', rows: 2 })
  ],
  preview: { select: { title: 'heading' }, prepare: ({ title }) => ({ title: title || 'Contact', subtitle: 'Contact' }) }
})

const pageBuilder = defineType({
  name: 'pageBuilder',
  title: 'Blocs de la page',
  type: 'array',
  of: [
    defineArrayMember({ type: 'trustBar' }),
    defineArrayMember({ type: 'servicesBlock' }),
    defineArrayMember({ type: 'serviceCitiesBlock' }),
    defineArrayMember({ type: 'aboutBlock' }),
    defineArrayMember({ type: 'testimonialsBlock' }),
    defineArrayMember({ type: 'faqBlock' }),
    defineArrayMember({ type: 'ctaBand' }),
    defineArrayMember({ type: 'contactBlock' })
  ]
})

/* ---------- Documents ---------- */

const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Reglages du site',
  type: 'document',
  icon: CogIcon,
  fields: [
    languageField,
    defineField({ name: 'brandName', title: 'Nom de la marque', type: 'string', initialValue: 'Rempart Extermination' }),
    defineField({ name: 'tagline', title: 'Slogan', type: 'text', rows: 2 }),
    defineField({ name: 'phoneDisplay', title: 'Telephone (affiche)', type: 'string' }),
    defineField({ name: 'phoneHref', title: 'Telephone (href tel:)', type: 'string' }),
    defineField({ name: 'emailDisplay', title: 'Courriel (affiche)', type: 'string' }),
    defineField({ name: 'emailHref', title: 'Courriel (href mailto:)', type: 'string' }),
    defineField({ name: 'areaName', title: 'Zone de service', type: 'string' }),
    defineField({ name: 'hours', title: 'Heures', type: 'string' }),
    // Adresse postale du siege (noeud LocalBusiness du SEO). Forme Schema.org.
    defineField({
      name: 'address',
      title: 'Adresse postale',
      type: 'object',
      fields: [
        defineField({ name: 'streetAddress', title: 'Rue et numero', type: 'string' }),
        defineField({ name: 'addressLocality', title: 'Ville', type: 'string' }),
        defineField({ name: 'addressRegion', title: 'Province', type: 'string' }),
        defineField({ name: 'postalCode', title: 'Code postal', type: 'string' }),
        defineField({ name: 'addressCountry', title: 'Pays', type: 'string' })
      ]
    })
  ],
  preview: { select: { language: 'language' }, prepare: ({ language }) => ({ title: 'Reglages du site', subtitle: (language || '').toUpperCase() }) }
})

const homePage = defineType({
  name: 'homePage',
  title: 'Page d’accueil',
  type: 'document',
  icon: HomeIcon,
  fields: [
    languageField,
    defineField({ name: 'seoTitle', title: 'Titre SEO', type: 'string' }),
    defineField({ name: 'seoDescription', title: 'Description SEO', type: 'text', rows: 2 }),
    defineField({ name: 'hero', title: 'Heros', type: 'heroHome' }),
    defineField({ name: 'pageBuilder', title: 'Blocs', type: 'pageBuilder' })
  ],
  preview: { select: { language: 'language' }, prepare: ({ language }) => ({ title: 'Page d’accueil', subtitle: (language || '').toUpperCase() }) }
})

const service = defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  icon: BugIcon,
  fields: [
    languageField,
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (r) => r.required() }),
    defineField({ name: 'icon', title: 'Icone (Iconify lucide)', type: 'string' }),
    defineField({ name: 'title', title: 'Titre', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'body', title: 'Description', type: 'text', rows: 3 }),
    defineField({ name: 'featured', title: 'Mis en vedette', type: 'boolean', initialValue: false }),
    defineField({ name: 'order', title: 'Ordre', type: 'number', initialValue: 0 })
  ],
  preview: { select: { title: 'title', language: 'language' }, prepare: ({ title, language }) => ({ title, subtitle: (language || '').toUpperCase() }) }
})

const serviceCity = defineType({
  name: 'serviceCity',
  title: 'Service par ville',
  type: 'document',
  icon: PinIcon,
  fields: [
    languageField,
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'city' }, validation: (r) => r.required() }),
    defineField({ name: 'city', title: 'Ville', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'region', title: 'Region', type: 'string' }),
    defineField({ name: 'note', title: 'Note (carte)', type: 'string' }),
    defineField({ name: 'featured', title: 'Mise en vedette', type: 'boolean', initialValue: false }),
    defineField({ name: 'order', title: 'Ordre', type: 'number', initialValue: 0 }),
    defineField({ name: 'heading', title: 'Titre de la page', type: 'string' }),
    defineField({ name: 'lead', title: 'Accroche de la page', type: 'text', rows: 3 }),
    defineField({ name: 'body', title: 'Contenu', type: 'array', of: [defineArrayMember({ type: 'text' })] }),
    defineField({ name: 'seoTitle', title: 'Titre SEO', type: 'string' }),
    defineField({ name: 'seoDescription', title: 'Description SEO', type: 'text', rows: 2 })
  ],
  preview: { select: { title: 'city', language: 'language' }, prepare: ({ title, language }) => ({ title, subtitle: `Ville ${(language || '').toUpperCase()}` }) }
})

const testimonial = defineType({
  name: 'testimonial',
  title: 'Temoignage',
  type: 'document',
  icon: StarIcon,
  fields: [
    languageField,
    defineField({ name: 'quote', title: 'Citation', type: 'text', rows: 3, validation: (r) => r.required() }),
    defineField({ name: 'name', title: 'Nom du client', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'city', title: 'Ville', type: 'string' }),
    defineField({ name: 'order', title: 'Ordre', type: 'number', initialValue: 0 })
  ],
  preview: { select: { title: 'name', subtitle: 'city' } }
})

const faqItem = defineType({
  name: 'faqItem',
  title: 'Question (FAQ)',
  type: 'document',
  icon: HelpCircleIcon,
  fields: [
    languageField,
    defineField({ name: 'question', title: 'Question', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'answer', title: 'Reponse', type: 'text', rows: 4, validation: (r) => r.required() }),
    defineField({ name: 'order', title: 'Ordre', type: 'number', initialValue: 0 })
  ],
  preview: { select: { title: 'question', language: 'language' }, prepare: ({ title, language }) => ({ title, subtitle: (language || '').toUpperCase() }) }
})

/* ---------- Blocs du corps d'article (objets) ---------- */

const articleLead = defineType({
  name: 'articleLead',
  title: 'Amorce',
  type: 'object',
  icon: BlockContentIcon,
  fields: [defineField({ name: 'text', title: 'Amorce', type: 'text', rows: 3, validation: (r) => r.required() })],
  preview: { select: { subtitle: 'text' }, prepare: ({ subtitle }) => ({ title: 'Amorce', subtitle }) }
})

const articleRichText = defineType({
  name: 'articleRichText',
  title: 'Texte riche',
  type: 'object',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'body',
      title: 'Contenu',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Titre de section', value: 'h2' },
            { title: 'Sous-titre', value: 'h3' }
          ],
          lists: [
            { title: 'Puces', value: 'bullet' },
            { title: 'Numerotee', value: 'number' }
          ],
          marks: {
            decorators: [
              { title: 'Gras', value: 'strong' },
              { title: 'Italique', value: 'em' }
            ],
            annotations: [
              defineArrayMember({
                name: 'link',
                title: 'Lien',
                type: 'object',
                fields: [
                  defineField({
                    name: 'href',
                    title: 'Destination',
                    type: 'string',
                    description: 'Route (/services), ancre (#contact) ou https://, tel:, mailto:.',
                    validation: (r) => r.required()
                  })
                ]
              })
            ]
          }
        })
      ]
    })
  ],
  preview: { prepare: () => ({ title: 'Texte riche' }) }
})

const articleImage = defineType({
  name: 'articleImage',
  title: 'Image',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({ name: 'image', title: 'Image', type: 'figure', validation: (r) => r.required() }),
    defineField({ name: 'caption', title: 'Legende', type: 'string' })
  ],
  preview: { select: { subtitle: 'image.alt' }, prepare: ({ subtitle }) => ({ title: 'Image', subtitle }) }
})

const articleQuote = defineType({
  name: 'articleQuote',
  title: 'Citation',
  type: 'object',
  icon: CommentIcon,
  fields: [
    defineField({ name: 'quote', title: 'Citation', type: 'text', rows: 3, validation: (r) => r.required() }),
    defineField({ name: 'attribution', title: 'Attribution', type: 'string' })
  ],
  preview: { select: { subtitle: 'quote' }, prepare: ({ subtitle }) => ({ title: 'Citation', subtitle }) }
})

const articleGallery = defineType({
  name: 'articleGallery',
  title: 'Galerie',
  type: 'object',
  icon: ImagesIcon,
  fields: [
    defineField({ name: 'items', title: 'Images', type: 'array', of: [defineArrayMember({ type: 'figure' })], validation: (r) => r.min(2) })
  ],
  preview: { select: { items: 'items' }, prepare: ({ items }) => ({ title: 'Galerie', subtitle: `${(items || []).length} images` }) }
})

const articleCallout = defineType({
  name: 'articleCallout',
  title: 'Encadre',
  type: 'object',
  icon: BulbOutlineIcon,
  fields: [
    defineField({
      name: 'tone',
      title: 'Ton',
      type: 'string',
      options: { list: [{ title: 'Note', value: 'note' }, { title: 'Avertissement', value: 'warning' }], layout: 'radio' },
      initialValue: 'note',
      validation: (r) => r.required()
    }),
    defineField({ name: 'title', title: 'Titre', type: 'string' }),
    defineField({ name: 'text', title: 'Texte', type: 'text', rows: 3, validation: (r) => r.required() })
  ],
  preview: { select: { title: 'title', subtitle: 'text' }, prepare: ({ title, subtitle }) => ({ title: title || 'Encadre', subtitle }) }
})

const articleInlineCta = defineType({
  name: 'articleInlineCta',
  title: 'Appel a l’action',
  type: 'object',
  icon: PhoneIcon,
  fields: [
    defineField({ name: 'text', title: 'Texte', type: 'text', rows: 2, validation: (r) => r.required() }),
    defineField({ name: 'cta', title: 'Bouton', type: 'link', validation: (r) => r.required() })
  ],
  preview: { select: { subtitle: 'text' }, prepare: ({ subtitle }) => ({ title: 'Appel a l’action', subtitle }) }
})

const articleBody = defineType({
  name: 'articleBody',
  title: 'Corps de l’article',
  type: 'array',
  of: [
    defineArrayMember({ type: 'articleLead' }),
    defineArrayMember({ type: 'articleRichText' }),
    defineArrayMember({ type: 'articleImage' }),
    defineArrayMember({ type: 'articleQuote' }),
    defineArrayMember({ type: 'articleGallery' }),
    defineArrayMember({ type: 'articleCallout' }),
    defineArrayMember({ type: 'articleInlineCta' })
  ]
})

/* ---------- Documents du blog ---------- */

const category = defineType({
  name: 'category',
  title: 'Categorie',
  type: 'document',
  icon: TagIcon,
  fields: [
    languageField,
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (r) => r.required() }),
    defineField({ name: 'title', title: 'Titre', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'description', title: 'Description (archive)', type: 'text', rows: 2 }),
    defineField({ name: 'order', title: 'Ordre', type: 'number', initialValue: 0 })
  ],
  preview: { select: { title: 'title', language: 'language' }, prepare: ({ title, language }) => ({ title, subtitle: `Categorie ${(language || '').toUpperCase()}` }) }
})

const article = defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    languageField,
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (r) => r.required() }),
    defineField({ name: 'title', title: 'Titre', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'excerpt', title: 'Accroche', type: 'text', rows: 3, validation: (r) => r.required() }),
    defineField({ name: 'cover', title: 'Couverture', type: 'figure', validation: (r) => r.required() }),
    defineField({
      name: 'category',
      title: 'Categorie',
      type: 'reference',
      to: [{ type: 'category' }],
      // Une categorie de la MEME langue que l'article (i18n document-level).
      options: { filter: ({ document }) => ({ filter: 'language == $lang', params: { lang: (document as { language?: string }).language || 'fr' } }) }
    }),
    defineField({ name: 'date', title: 'Date de publication', type: 'date', validation: (r) => r.required() }),
    defineField({ name: 'author', title: 'Auteur', type: 'string' }),
    defineField({ name: 'readingMinutes', title: 'Duree de lecture (min)', type: 'number' }),
    defineField({ name: 'body', title: 'Corps', type: 'articleBody' })
  ],
  orderings: [{ title: 'Date (recent)', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] }],
  preview: { select: { title: 'title', language: 'language', media: 'cover' }, prepare: ({ title, language }) => ({ title, subtitle: `Article ${(language || '').toUpperCase()}` }) }
})

export const schemaTypes: SchemaTypeDefinition[] = [
  // objets
  figure,
  link,
  proof,
  stat,
  heroHome,
  trustBarBlock,
  servicesBlock,
  serviceCitiesBlock,
  aboutBlock,
  testimonialsBlock,
  faqBlock,
  ctaBandBlock,
  contactBlock,
  pageBuilder,
  // objets d'article
  articleLead,
  articleRichText,
  articleImage,
  articleQuote,
  articleGallery,
  articleCallout,
  articleInlineCta,
  articleBody,
  // documents
  siteSettings,
  homePage,
  service,
  serviceCity,
  testimonial,
  faqItem,
  category,
  article
]
