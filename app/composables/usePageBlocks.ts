// Assembleurs de blocs par page (mode multipage) et résolution des blocs
// intelligents du payload Sanity.
//
// Deux régimes, même sortie typée PageBlock[] que l'orchestrateur
// regular/index.vue rend (le héros n'y figure jamais: la page le rend à part):
//   - pages composées au Studio (accueil, services, à propos, projets, contact,
//     FAQ, one-pager): le pageBuilder SEMI-résolu du payload (copie transformée
//     + paramètres de sélection) passe par resolveBlocks(), qui résout les
//     items des 5 blocs intelligents contre les collections, en réutilisant
//     les composables de requête existants (zéro duplication des règles);
//   - pages de détail (service, projet): composition code inchangée, la copie
//     vit sur le DOCUMENT de collection lui-même (service.detail,
//     project.detail, spec 6.10, 6.11 et 12.16): chaque page de détail peut
//     diverger du gabarit document par document. `pad` et l'exclusion du
//     document courant restent des paramètres code, jamais stockés au Studio.
//
// AUCUNE copie autorée ici: toute la copie vit dans Sanity (documents de
// page). Les helpers ne font que décorer (_type, _key) et résoudre les items
// vers la forme attendue par les blocs (images en src string, _type kebab).

import { computed, type ComputedRef } from 'vue'
import type {
  PageBlock,
  ServicesBlock,
  TestimonialsBlock,
  FaqBlock,
  ProjectsPreviewBlock,
  BlogPreviewBlock
} from '~/types/blocks'
import type {
  PayloadPageBlock,
  PendingServicesBlock,
  PendingTestimonialsBlock,
  PendingFaqBlock,
  PendingProjectsPreviewBlock,
  PendingBlogPreviewBlock,
  ServiceWithMeta,
  ProjectWithDetail
} from '~/sanity/transform'
import type { TestimonialsContent } from '~/content/testimonials'
import type { ProjectsPreviewContent } from '~/content/projects-preview'
import { serviceImage } from '~/content/services'
import type { Project } from '~/content/projects'
import { routePath } from '~/config/route-map'

// ── Items partagés ──────────────────────────────────────────────────────────

/** Tronque à `limit` quand il est défini (sélection Studio), sinon tout. */
function limited<T>(items: T[], limit?: number): T[] {
  return typeof limit === 'number' ? items.slice(0, limit) : items
}

/** Sélection manuelle: résout les refs dans LEUR ordre (l'éditeur ordonne la
 *  liste au Studio), pas l'ordre de la collection. Ref brisée (clé absente)
 *  écartée sans trou. Même règle que useFaq({ ids }) (spec 12.8). */
function orderedByRefs<T>(pool: T[], refs: string[], key: (item: T) => string): T[] {
  const byKey = new Map(pool.map((item) => [key(item), item]))
  return refs.map((ref) => byKey.get(ref)).filter((item): item is T => item !== undefined)
}

// Item de carte projet: relation résolue en titre affichable (le slug brut ne
// sort jamais à l'écran).
function projectsPreviewItem(p: Project) {
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    service: useService(p.service)?.title ?? p.service,
    cover: p.cover
  }
}

// ── Résolution des 5 blocs intelligents (selection -> items) ────────────────
// Modes et champs: spec SANITY-SCHEMA-SPEC.md sections 4.2 à 4.4, 4.12, 4.13.

function resolveServicesBlock(block: PendingServicesBlock): ServicesBlock {
  const { selection, ...copy } = block
  // auto = toute la banque (ordre de la collection); manual = refs (slugs)
  // résolues dans l'ORDRE des refs (l'éditeur ordonne la liste au Studio).
  const pool =
    selection.mode === 'manual'
      ? orderedByRefs(useServices(), selection.refs, (s) => s.slug)
      : useServices()
  // Base localisée des pages de détail (préfixe /en inclus en EN): un href
  // construit en dur sur la base FR enverrait les cartes EN vers des 404.
  const detailBase = routePath('services', useWfLocale())
  return {
    ...copy,
    items: limited(pool, selection.limit).map((s) => ({
      n: s.n,
      title: s.title,
      body: s.summary,
      meta: s.meta,
      image: s.image,
      // Lien vers la page de détail du service. Retiré en CODE sur le one-pager
      // (pas de pages de détail), cf. useOnePagerBlocks: décision contextuelle,
      // jamais un champ Studio.
      href: `${detailBase}/${s.slug}`
    }))
  }
}

function resolveTestimonialsBlock(block: PendingTestimonialsBlock): TestimonialsBlock {
  const { selection, ...copy } = block
  // La grille de témoignages doit toujours être pleine (jamais de carte vide).
  // Pour les modes par filtre (vedettes, service, projet), on complète jusqu'à
  // la limite avec d'autres témoignages quand la sélection est plus courte. Le
  // mode manuel reste exact: l'éditeur a choisi précisément ces témoignages.
  const query: Parameters<typeof useTestimonials>[0] =
    selection.mode === 'manual'
      ? { ids: selection.refs, limit: selection.limit }
      : selection.mode === 'service'
        ? { service: selection.service, limit: selection.limit, pad: true }
        : selection.mode === 'project'
          ? { project: selection.project, limit: selection.limit, pad: true }
          : { featured: true, limit: selection.limit, pad: true }
  return {
    ...copy,
    items: useTestimonials(query).map((t) => ({ quote: t.quote, name: t.name, context: t.context }))
  }
}

function resolveFaqBlock(block: PendingFaqBlock): FaqBlock {
  const { selection, ...copy } = block
  // Sélection manuelle PURE (spec 4.4): refs (_id Sanity) résolues dans
  // l'ordre de l'array (12.8). Plus de mode ni de limit.
  return {
    ...copy,
    items: useFaq({ ids: selection.refs }).map((f) => ({ q: f.q, a: f.a }))
  }
}

function resolveProjectsPreviewBlock(block: PendingProjectsPreviewBlock): ProjectsPreviewBlock {
  const { selection, ...copy } = block
  const pool =
    selection.mode === 'manual'
      ? orderedByRefs(useProjects(), selection.refs, (p) => p.slug)
      : selection.mode === 'service'
        ? useProjects({ service: selection.service })
        : useProjects({ featured: true })
  return {
    ...copy,
    items: limited(pool, selection.limit).map(projectsPreviewItem)
  }
}

function resolveBlogPreviewBlock(block: PendingBlogPreviewBlock): BlogPreviewBlock {
  const { selection, ...copy } = block
  return {
    ...copy,
    // articleCard résout la catégorie en titre affichable (jamais le slug brut).
    items: useArticles({ limit: selection.limit }).map(articleCard)
  }
}

/**
 * pageBuilder du payload (blocs semi-résolus) -> blocs finals attendus par
 * l'orchestrateur. Les 10 blocs autonomes sortent du transform déjà dans leur
 * forme finale; les 5 blocs intelligents résolvent leurs items ici.
 */
export function resolveBlocks(blocks: PayloadPageBlock[]): PageBlock[] {
  return blocks.map((block) => {
    switch (block._type) {
      case 'services':
        return resolveServicesBlock(block)
      case 'testimonials':
        return resolveTestimonialsBlock(block)
      case 'faq':
        return resolveFaqBlock(block)
      case 'projects-preview':
        return resolveProjectsPreviewBlock(block)
      case 'blog-preview':
        return resolveBlogPreviewBlock(block)
      default:
        return block
    }
  })
}

// ── Helpers des compositions code (pages de détail) ─────────────────────────
// Chacun reçoit la copie de section depuis le gabarit du payload
// (Omit<…, 'items'>) et résout les items depuis la collection: composition pure.

function testimonialsBlock(
  key: string,
  copy: Omit<TestimonialsContent, 'items'>,
  query: Parameters<typeof useTestimonials>[0] = { featured: true }
): TestimonialsBlock {
  return {
    _type: 'testimonials',
    _key: key,
    ...copy,
    items: useTestimonials(query).map((t) => ({
      quote: t.quote,
      name: t.name,
      context: t.context
    }))
  }
}

function projectsPreviewBlock(
  key: string,
  copy: Omit<ProjectsPreviewContent, 'items'>,
  query: Parameters<typeof useProjects>[0]
): ProjectsPreviewBlock {
  return {
    _type: 'projects-preview',
    _key: key,
    ...copy,
    items: useProjects(query).map(projectsPreviewItem)
  }
}

// ── Assembleurs par page ────────────────────────────────────────────────────

// Assembleurs PUBLICS rendus directement par les pages: ils retournent un
// computed pour que les blocs se mettent à jour IN-PLACE en preview (le template
// auto-unwrap le ref; resolveBlocks/useFixedPage -> usePayload lisent le store
// live). resolveBlocks et les composables de requête (useServices, etc.) restent
// PLAIN: appelés DANS ce computed, leurs lectures de usePayload sont suivies.
export function useHomeBlocks(): ComputedRef<PageBlock[]> {
  return computed(() => resolveBlocks(useFixedPage('home').pageBuilder))
}

export function useServicesPageBlocks(): ComputedRef<PageBlock[]> {
  return computed(() => resolveBlocks(useFixedPage('services').pageBuilder))
}

export function useAboutBlocks(): ComputedRef<PageBlock[]> {
  return computed(() => resolveBlocks(useFixedPage('about').pageBuilder))
}

export function useProjectsPageBlocks(): ComputedRef<PageBlock[]> {
  // La grille de projets est rendue au niveau de la page (collection). Le
  // pageBuilder du doc ne porte que la sortie de conversion.
  return computed(() => resolveBlocks(useFixedPage('projects').pageBuilder))
}

// Additifs T2a: les compositions de /contact et /faq vivaient dans les pages
// (consts importées); elles passent désormais par la même frontière que les
// autres pages composées au Studio.
export function useContactPageBlocks(): ComputedRef<PageBlock[]> {
  return computed(() => resolveBlocks(useFixedPage('contact').pageBuilder))
}

export function useFaqPageBlocks(): ComputedRef<PageBlock[]> {
  return computed(() => resolveBlocks(useFixedPage('faq').pageBuilder))
}

// La copie des sections vient de l'ITEM reçu (service.detail, 12.16): chaque
// service porte sa propre copie de page de détail, plus de gabarit partagé.
export function useServiceBlocks(service: ServiceWithMeta): PageBlock[] {
  // detail FULL garanti: ce composable ne tourne QUE sur l'item de la route de
  // détail (jamais une carte du preview scopé, qui n'a pas de detail).
  const detail = service.detail!
  // Le héros de la page affiche déjà l'image du service: on ouvre donc le corps
  // par les bénéfices (textuels, aucune image, ça respire) plutôt que par un
  // media-text qui rejouait la même photo juste sous le héros. Le media-text
  // d'intro descend ensuite, avec l'image d'un PROJET du service (variété
  // visuelle réelle), et retombe sur l'image du service s'il n'y a aucun projet.
  const introProject = useProjects({ service: service.slug, limit: 1 })[0]
  const introImage = introProject ? { ...introProject.cover } : serviceImage(service)
  const blocks: PageBlock[] = [
    {
      _type: 'highlights',
      _key: `service-${service.slug}-benefits`,
      heading: detail.included.heading,
      items: service.benefits.map((b) => ({ title: b.title, body: b.body }))
    },
    {
      _type: 'media-text',
      _key: `service-${service.slug}-intro`,
      heading: detail.benefits.heading,
      body: service.intro,
      mediaSide: 'right',
      image: introImage,
      cta: detail.benefits.cta
    },
    // Processus de la page de détail (champ dédié detail.process de CE
    // document service, ajustable document par document).
    { _type: 'process', _key: `service-${service.slug}-process`, ...detail.process }
  ]

  if (service.related.length) {
    blocks.push(
      projectsPreviewBlock(
        `service-${service.slug}-projects`,
        detail.projects,
        { service: service.slug, limit: 3, pad: true }
      )
    )
  }

  const serviceTestimonials = useTestimonials({ service: service.slug })
  if (serviceTestimonials.length) {
    blocks.push(testimonialsBlock(`service-${service.slug}-testimonials`, detail.testimonials, { service: service.slug, limit: 3, pad: true }))
  }

  blocks.push(
    { _type: 'cta-band', _key: `service-${service.slug}-cta`, ...detail.cta }
  )
  return blocks
}

// Même principe que useServiceBlocks: la copie vient de l'ITEM (project.detail).
export function useProjectBlocks(project: ProjectWithDetail): PageBlock[] {
  // detail FULL garanti (cf. useServiceBlocks): item de la route détail seulement.
  const detail = project.detail!
  const caseStudyCopy = detail.caseStudy
  const blocks: PageBlock[] = [
    {
      _type: 'media-text',
      _key: `project-${project.slug}-case`,
      eyebrow: caseStudyCopy.eyebrow,
      heading: caseStudyCopy.heading,
      body: [
        `${caseStudyCopy.challengeLabel}: ${project.challenge}`,
        `${caseStudyCopy.solutionLabel}: ${project.solution}`,
        `${caseStudyCopy.resultLabel}: ${project.result}`
      ],
      mediaSide: 'right',
      image: { ...project.cover }
    }
  ]

  if (project.stats?.length) {
    blocks.push({ _type: 'stats', _key: `project-${project.slug}-stats`, items: project.stats })
  }
  if (project.testimonial) {
    blocks.push(testimonialsBlock(`project-${project.slug}-testimonial`, detail.testimonial, { ids: [project.testimonial] }))
  }

  // « Projets similaires » seulement si la sélection est non vide (même garde que
  // related/testimonials plus haut): pas de pad, le titre promet du similaire;
  // quatre services n'ont qu'un seul projet et tomberaient sur une grille vide.
  const similarQuery = { service: project.service, exclude: project.slug, limit: 3 }
  if (useProjects(similarQuery).length) {
    blocks.push(
      projectsPreviewBlock(`project-${project.slug}-similar`, detail.similar, similarQuery)
    )
  }

  blocks.push(
    { _type: 'cta-band', _key: `project-${project.slug}-cta`, ...detail.cta }
  )
  return blocks
}
