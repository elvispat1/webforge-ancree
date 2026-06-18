import { appendHeader } from 'h3'

/* usePrerenderImages — hint de prérendu pour les images construites à la main.
 *
 * PIÈGE (plan T2c, vérifié dans la source @nuxt/image runtime/image.js): seul
 * `getImage` (le chemin <NuxtImg>) appose le header `x-nitro-prerender` pendant
 * le generate; `useImage().getSizes()` n'émet RIEN. Toute balise <img>/<picture>
 * assemblée manuellement depuis getSizes (art direction du héros home, D23)
 * doit donc déclarer elle-même ses variantes /_ipx/, sinon Nitro ne les génère
 * pas en fichiers statiques et le build casse au crawl (404).
 *
 * Accepte des chaînes srcset (`url 500w, url 1000w`) ou des URLs nues (src):
 * chaque entrée est réduite à son URL, filtrée sur /_ipx/ et émise encodée,
 * miroir exact de `prerenderStaticImages` de @nuxt/image (non exporté
 * publiquement). No-op hors prerender (dev, client, SSR runtime).
 * Candidat webforge-core au 2e site. */
export function usePrerenderImages(...sources: Array<string | undefined>): void {
  if (!import.meta.server || !import.meta.prerender) return
  const event = useRequestEvent()
  if (!event) return
  const urls = sources
    .filter((source): source is string => !!source)
    .flatMap((source) => source.split(', '))
    .map((entry) => entry.trim().split(' ')[0]?.trim() ?? '')
    .filter((url) => url.includes('/_ipx/'))
  if (!urls.length) return
  appendHeader(event, 'x-nitro-prerender', urls.map((url) => encodeURIComponent(url)).join(', '))
}
