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
  PhoneIcon
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
    defineField({ name: 'hours', title: 'Heures', type: 'string' })
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
  // documents
  siteSettings,
  homePage,
  service,
  serviceCity,
  testimonial,
  faqItem
]
