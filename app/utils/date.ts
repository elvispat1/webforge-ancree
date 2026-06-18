// Formatage de date localisé et déterministe. Entrée: ISO 'YYYY-MM-DD'.
//
// Conscient de la locale (MAJ-08): même mécanique que formatLegalDate dans
// transform.ts (Intl.DateTimeFormat + timeZone UTC), pour que les dates d'article
// s'affichent en français sous /blog et en anglais sous /en/blog (plus de dates
// françaises sur les pages EN). timeZone UTC = résultat identique au build (Node)
// et à l'hydratation (navigateur): aucun décalage de prérendu statique. Pattern
// destiné à webforge-core au 2e consommateur.
import type { WfLocale } from '~/sanity/transform'

export function formatDate(iso: string, locale: WfLocale): string {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-CA' : 'fr-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(Date.UTC(y, m - 1, d)))
}
