// Assembleurs de blocs par page (mode multipage) et resolution des blocs
// intelligents du payload Sanity.
//
// Deux regimes, meme sortie typee PageBlock[] que l'orchestrateur de page rend (le
// heros n'y figure jamais: la page le rend a part):
//   - pages composees au Studio (accueil, services, villes, a-propos, contact, FAQ,
//     one-pager): le pageBuilder SEMI-resolu du payload (copie transformee +
//     parametres de selection) passe par resolveBlocks(), qui resout les items des 4
//     blocs intelligents (services, service-cities, testimonials, faq) contre les
//     collections, en reutilisant les composables de requete (zero duplication des
//     regles);
//   - pages de detail (service): composition code, la copie vit sur le DOCUMENT de
//     collection lui-meme (service.detail). `pad` et l'exclusion du document courant
//     restent des parametres code, jamais stockes au Studio.
//
// AUCUNE copie autoree ici: toute la copie vit dans Sanity. Les helpers ne font que
// decorer (_type, _key) et resoudre les items vers la forme attendue par les blocs
// (app/types/blocks.ts AU CHAMP PRES, la PEAU est intouchable). Porte de Minimaliste,
// adapte aux 8 blocs d'Ancree (project -> serviceCity/city, pas de projectsPreview ni
// de blogPreview).

import { computed, type ComputedRef } from 'vue'
import type {
  PageBlock,
  ServicesBlock,
  ServiceCitiesBlock,
  TestimonialsBlock,
  FaqBlock
} from '~/types/blocks'
import type {
  PayloadPageBlock,
  PendingServicesBlock,
  PendingServiceCitiesBlock,
  PendingTestimonialsBlock,
  PendingFaqBlock,
  ServiceWithMeta,
  ServiceCityWithDetail
} from '~/sanity/transform'
import type { TestimonialsContent } from '~/content/testimonials'
import { routePath, serviceCityPath } from '~/config/route-map'

// ── Items partages ──────────────────────────────────────────────────────────

/** Tronque a `limit` quand il est defini (selection Studio), sinon tout. */
function limited<T>(items: T[], limit?: number): T[] {
  return typeof limit === 'number' ? items.slice(0, limit) : items
}

/** Selection manuelle: resout les refs dans LEUR ordre (l'editeur ordonne la liste
 *  au Studio), pas l'ordre de la collection. Ref brisee (cle absente) ecartee sans
 *  trou. Meme regle que useFaq({ ids }). */
function orderedByRefs<T>(pool: T[], refs: string[], key: (item: T) => string): T[] {
  const byKey = new Map(pool.map((item) => [key(item), item]))
  return refs.map((ref) => byKey.get(ref)).filter((item): item is T => item !== undefined)
}

// ── Resolution des 4 blocs intelligents (selection -> items) ─────────────────

function resolveServicesBlock(block: PendingServicesBlock): ServicesBlock {
  const { selection, ...copy } = block
  // auto = toute la banque (ordre de la collection); manual = refs (slugs) resolues
  // dans l'ORDRE des refs (l'editeur ordonne la liste au Studio).
  const pool =
    selection.mode === 'manual'
      ? orderedByRefs(useServices(), selection.refs, (s) => s.slug)
      : useServices()
  // Base localisee des pages de detail (prefixe /en inclus en EN): un href construit
  // en dur sur la base FR enverrait les cartes EN vers des 404.
  const detailBase = routePath('services', useWfLocale())
  return {
    ...copy,
    items: limited(pool, selection.limit).map((s) => ({
      icon: s.icon ?? '',
      title: s.title,
      summary: s.summary ?? '',
      // Lien vers la page de detail du service. Retire en CODE sur le one-pager
      // (pas de pages de detail), cf. useOnePagerBlocks: decision contextuelle,
      // jamais un champ Studio.
      href: `${detailBase}/${s.slug}`,
      featured: s.featured
    }))
  }
}

function resolveServiceCitiesBlock(block: PendingServiceCitiesBlock): ServiceCitiesBlock {
  const { selection, ...copy } = block
  // auto = toute la banque; manual = refs (slugs) resolues dans l'ordre des refs.
  const pool =
    selection.mode === 'manual'
      ? orderedByRefs(useServiceCities(), selection.refs, (c) => c.slug)
      : useServiceCities()
  const locale = useWfLocale()
  return {
    ...copy,
    cities: limited(pool, selection.limit).map((c) => ({
      name: c.city,
      href: serviceCityPath(c.slug, locale),
      note: c.note,
      featured: c.featured
    }))
  }
}

function resolveTestimonialsBlock(block: PendingTestimonialsBlock): TestimonialsBlock {
  const { selection, ...copy } = block
  // La grille de temoignages doit toujours etre pleine (jamais de carte vide). Pour
  // les modes par filtre (vedettes, service, ville), on complete jusqu'a la limite
  // avec d'autres temoignages quand la selection est plus courte. Le mode manuel
  // reste exact: l'editeur a choisi precisement ces temoignages.
  const query: Parameters<typeof useTestimonials>[0] =
    selection.mode === 'manual'
      ? { ids: selection.refs, limit: selection.limit }
      : selection.mode === 'service'
        ? { service: selection.service, limit: selection.limit, pad: true }
        : selection.mode === 'city'
          ? { city: selection.city, limit: selection.limit, pad: true }
          : { featured: true, limit: selection.limit, pad: true }
  return {
    ...copy,
    // `city` du contrat affiche le LIEU du client (t.context, libelle lisible),
    // distinct du filtre `city` (slug de serviceCity) consomme par useTestimonials.
    items: useTestimonials(query).map((t) => ({ quote: t.quote, name: t.name, city: t.context ?? '' }))
  }
}

function resolveFaqBlock(block: PendingFaqBlock): FaqBlock {
  const { selection, ...copy } = block
  // Selection manuelle PURE: refs (_id Sanity) resolues dans l'ordre de l'array.
  return {
    ...copy,
    items: useFaq({ ids: selection.refs }).map((f) => ({ q: f.q, a: f.a }))
  }
}

/**
 * pageBuilder du payload (blocs semi-resolus) -> blocs finals attendus par
 * l'orchestrateur. Les 4 blocs autonomes (trust-bar, about, cta-band, contact)
 * sortent du transform deja dans leur forme finale; les 4 blocs intelligents
 * resolvent leurs items ici.
 */
export function resolveBlocks(blocks: PayloadPageBlock[]): PageBlock[] {
  return blocks.map((block) => {
    switch (block._type) {
      case 'services':
        return resolveServicesBlock(block)
      case 'service-cities':
        return resolveServiceCitiesBlock(block)
      case 'testimonials':
        return resolveTestimonialsBlock(block)
      case 'faq':
        return resolveFaqBlock(block)
      default:
        return block
    }
  })
}

// ── Helpers des compositions code (pages de detail) ──────────────────────────
// Chacun recoit la copie de section depuis le gabarit du payload (Omit<…, items>)
// et resout les items depuis la collection: composition pure.

function testimonialsBlock(
  key: string,
  copy: Omit<TestimonialsContent, 'items'>,
  query: Parameters<typeof useTestimonials>[0] = { featured: true }
): TestimonialsBlock {
  return {
    _type: 'testimonials',
    _key: key,
    ...copy,
    items: useTestimonials(query).map((t) => ({ quote: t.quote, name: t.name, city: t.context ?? '' }))
  }
}

// ── Assembleurs par page ──────────────────────────────────────────────────────

// Assembleurs PUBLICS rendus directement par les pages: ils retournent un computed
// pour que les blocs se mettent a jour IN-PLACE en preview (le template auto-unwrap
// le ref; resolveBlocks/useFixedPage -> usePayload lisent le store live).
// resolveBlocks et les composables de requete restent PLAIN: appeles DANS ce
// computed, leurs lectures de usePayload sont suivies.
export function useHomeBlocks(): ComputedRef<PageBlock[]> {
  return computed(() => resolveBlocks(useFixedPage('home').pageBuilder))
}

export function useServicesPageBlocks(): ComputedRef<PageBlock[]> {
  return computed(() => resolveBlocks(useFixedPage('services').pageBuilder))
}

export function useVillesPageBlocks(): ComputedRef<PageBlock[]> {
  return computed(() => resolveBlocks(useFixedPage('villes').pageBuilder))
}

export function useAboutBlocks(): ComputedRef<PageBlock[]> {
  return computed(() => resolveBlocks(useFixedPage('about').pageBuilder))
}

export function useContactPageBlocks(): ComputedRef<PageBlock[]> {
  return computed(() => resolveBlocks(useFixedPage('contact').pageBuilder))
}

export function useFaqPageBlocks(): ComputedRef<PageBlock[]> {
  return computed(() => resolveBlocks(useFixedPage('faq').pageBuilder))
}

// La copie des sections vient de l'ITEM recu (service.detail): chaque service porte
// sa propre copie de page de detail, plus de gabarit partage. detail FULL garanti:
// ce composable ne tourne QUE sur l'item de la route de detail (jamais une carte du
// preview scope, qui n'a pas de detail).
export function useServiceBlocks(service: ServiceWithMeta): PageBlock[] {
  const detail = service.detail!
  // Seuls les blocs de la PEAU d'Ancree (les 8) sont emis ici. La copie de detail
  // qui n'a pas de bloc correspondant (benefits, included, copie de zone) est rendue
  // par le GABARIT de la page de detail, pas par le page-builder. Sequence: le
  // processus pose la methode, les temoignages rassurent, le bandeau d'appel conclut.
  const blocks: PageBlock[] = [
    // Processus de la page de detail (champ dedie detail.process de CE document
    // service, ajustable document par document).
    { _type: 'process', _key: `service-${service.slug}-process`, ...detail.process }
  ]

  const serviceTestimonials = useTestimonials({ service: service.slug })
  if (serviceTestimonials.length) {
    blocks.push(
      testimonialsBlock(
        `service-${service.slug}-testimonials`,
        detail.testimonials,
        { service: service.slug, limit: 3, pad: true }
      )
    )
  }

  blocks.push({ _type: 'cta-band', _key: `service-${service.slug}-cta`, ...detail.cta })
  return blocks
}
