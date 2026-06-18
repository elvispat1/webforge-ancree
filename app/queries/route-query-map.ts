// Table route -> requête scopée par-page (preview).
//
// C'est le « par-page » du refactor: chaque route est mappée vers SON fichier de
// requête (app/queries/pages/), comme dans les projets de référence (Ombrelle).
// Source de vérité des chemins: app/config/route-map.ts (un seul endroit pour les
// segments d'URL, bilingue). Plain TS, imports relatifs.

import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  ROUTES,
  ONE_PAGER_PAGES,
  type Locale
} from '../config/route-map'
import { HOME_QUERY } from './pages/home'
import { SERVICES_INDEX_QUERY } from './pages/services-index'
import { SERVICE_DETAIL_QUERY } from './pages/service-detail'
import { PROJECTS_INDEX_QUERY } from './pages/projects-index'
import { PROJECT_DETAIL_QUERY } from './pages/project-detail'
import { ABOUT_QUERY } from './pages/about'
import { BLOG_INDEX_QUERY } from './pages/blog-index'
import { ARTICLE_DETAIL_QUERY } from './pages/article-detail'
import { FAQ_QUERY } from './pages/faq'
import { CONTACT_QUERY } from './pages/contact'
import { ONE_PAGER_QUERY } from './pages/one-pager'
import { LEGAL_QUERY } from './pages/legal'

export interface PreviewQuery {
  /** La requête GROQ de la route (un des fichiers de pages/). */
  query: string
  /** Slug de l'item de détail (dernier segment); '' pour les routes sans détail.
   *  Toujours passé en param $slug; ignoré par les requêtes qui ne le réfèrent pas. */
  slug: string
}

/** Retire le préfixe de locale (`/en`) d'un chemin et retourne la locale détectée. */
function stripLocale(path: string): { locale: Locale; rest: string } {
  for (const loc of SUPPORTED_LOCALES) {
    if (loc === DEFAULT_LOCALE) continue
    const prefix = `/${loc}`
    if (path === prefix) return { locale: loc, rest: '/' }
    if (path.startsWith(`${prefix}/`)) return { locale: loc, rest: path.slice(prefix.length) }
  }
  return { locale: DEFAULT_LOCALE, rest: path || '/' }
}

/**
 * Déduit la requête scopée + le slug d'un chemin. Les pages fixes -> leur requête
 * de singleton; les pages de détail -> leur requête de détail + $slug (dernier
 * segment). Le cas /blog/<slug> ambigu (catégorie vs article) est servi par
 * ARTICLE_DETAIL_QUERY: si $slug est une catégorie, aucun article ne matche et la
 * collection reste en cartes (correct pour l'archive). Routes légales et inconnues
 * -> LEGAL_QUERY (chrome global seulement).
 */
export function resolvePreviewQuery(path: string): PreviewQuery {
  const { locale, rest } = stripLocale(path)
  const p = rest.replace(/\/+$/, '') || '/'
  if (p === '/') return { query: HOME_QUERY, slug: '' }

  const segs = p.slice(1).split('/')
  const last = segs[segs.length - 1] ?? ''

  const servicesBase = ROUTES.services.path[locale]
  const projectsBase = ROUTES.projects.path[locale]
  const blogBase = ROUTES.blog.path[locale]

  // Pages fixes (correspondance exacte).
  if (p === servicesBase) return { query: SERVICES_INDEX_QUERY, slug: '' }
  if (p === projectsBase) return { query: PROJECTS_INDEX_QUERY, slug: '' }
  if (p === ROUTES.about.path[locale]) return { query: ABOUT_QUERY, slug: '' }
  if (p === ROUTES.faq.path[locale]) return { query: FAQ_QUERY, slug: '' }
  if (p === ROUTES.contact.path[locale]) return { query: CONTACT_QUERY, slug: '' }
  if (p === ONE_PAGER_PAGES.index.path[locale]) return { query: ONE_PAGER_QUERY, slug: '' }

  // Pages légales (multipage + one-pager): chrome global seulement.
  if (p === ROUTES.terms.path[locale] || p === ROUTES.privacy.path[locale]) return { query: LEGAL_QUERY, slug: '' }
  if (p === ONE_PAGER_PAGES.terms.path[locale] || p === ONE_PAGER_PAGES.privacy.path[locale]) return { query: LEGAL_QUERY, slug: '' }

  // Blog: index + pagination = listing (blogPage full); sinon article/catégorie.
  if (p === blogBase) return { query: BLOG_INDEX_QUERY, slug: '' }
  if (p.startsWith(`${blogBase}/page/`)) return { query: BLOG_INDEX_QUERY, slug: '' }
  if (p.startsWith(`${blogBase}/`)) return { query: ARTICLE_DETAIL_QUERY, slug: last }

  // Pages de détail à slug.
  if (p.startsWith(`${servicesBase}/`)) return { query: SERVICE_DETAIL_QUERY, slug: last }
  if (p.startsWith(`${projectsBase}/`)) return { query: PROJECT_DETAIL_QUERY, slug: last }

  // Route inconnue: chrome global, la page gère son propre 404.
  return { query: LEGAL_QUERY, slug: '' }
}
