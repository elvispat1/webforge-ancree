<script setup lang="ts">
/* Accueil MULTIPAGE (mode Multipage, racine /). Une passerelle: le heros, puis
 * un choix d'apercus qui MENENT aux pages dediees (services -> /services, villes
 * -> pages service-ville, temoignages, bandeau d'appel -> /contact). Le contenu
 * profond (a-propos, FAQ, formulaire) vit sur ses pages dediees, joignables par
 * la nav multipage; on ne le duplique pas ici. En-tete en mode multipage (liens
 * de route), via le layout default.
 *
 * Contenu de demo via fixtures (comme les autres pages multipage), en attendant
 * un type de page d'accueil Sanity. Les gestes qui pointaient vers une ancre du
 * one-pager (#contact) sont recables vers la vraie route /contact. */
import type { HeroHomeBlock, PageBlock } from '~/types/blocks'
import type { SiteIdentity } from '~/content/site'
import { siteFixture } from '~/content/site'
import { HOME_SEO_QUERY } from '~/sanity/content'

const { t, locale } = useI18n()
const isEn = computed(() => locale.value === 'en')
const localePrefix = computed(() => (isEn.value ? '/en' : ''))

// Blocs retenus pour la passerelle (apercus + conversion), dans l'ordre de rendu.
const GATEWAY_BLOCKS = new Set(['trust-bar', 'services', 'service-cities', 'testimonials', 'cta-band'])

// Recable une ancre du one-pager (#contact) vers la vraie route /contact.
function toContactRoute(href: string | undefined): string | undefined {
  return href === '#contact' ? `${localePrefix.value}/contact` : href
}

const heroBase = useHeroContent()
const hero = computed<HeroHomeBlock>(() => ({
  ...heroBase.value,
  secondaryCta: { ...heroBase.value.secondaryCta, href: `${localePrefix.value}/contact` }
}))

const blocks = computed<PageBlock[]>(() =>
  useHomeBlocks()
    .filter((b) => GATEWAY_BLOCKS.has(b._type))
    .map((b) => {
      // Bandeau d'appel: geste secondaire vers la vraie route /contact.
      if (b._type === 'cta-band') {
        return { ...b, secondaryCta: b.secondaryCta ? { ...b.secondaryCta, href: toContactRoute(b.secondaryCta.href)! } : undefined }
      }
      // Services (apercu): les cartes ne sont PAS des liens individuels (pas de
      // page par nuisible; les slugs /extermination/* sont des VILLES, pas des
      // services). On neutralise les href des items; le CTA « Voir tous les
      // services » -> /services reste le chemin. Cartes informatives, posees.
      if (b._type === 'services') {
        const items = (b as { items?: Array<Record<string, unknown>> }).items ?? []
        return { ...b, items: items.map((it) => ({ ...it, href: undefined })) }
      }
      return b
    })
)

// SEO + identite de l'accueil (Sanity au build, repli fixtures/i18n). Le
// seoTitle/seoDescription du document homePage alimente le SEO de la racine (MEME
// source que le one-pager); le NAP de siteSettings alimente le LocalBusiness.
// Snapshot setup-once: le SEO de tete n'est pas reactif.
const { data: homeRaw } = await useSanityBuildQuery<{ seo: { title?: string; description?: string } | null; site: SiteIdentity | null } | null>(
  `home-seo:${locale.value}`,
  HOME_SEO_QUERY,
  { lang: locale.value }
)
const identity = homeRaw.value?.site ?? siteFixture(isEn.value)
const siteConfig = useSiteConfig()

// Accueil (racine): titre/description du CMS (homePage), repli i18n. Titre COMPLET
// (porte deja la marque) -> gabarit neutralise pour ne pas doubler le suffixe.
// Visuel OG du heros. Nom du LocalBusiness = site.name, la source UNIQUE de la
// marque (alignee sur le noeud Organization du graphe, aucun repli divergent).
// Pas de fil d'Ariane (page racine). Suit le patron Minimaliste de l'accueil.
usePageSeo({
  title: homeRaw.value?.seo?.title || t('home.title'),
  description: homeRaw.value?.seo?.description || t('home.lead'),
  titleTemplate: null,
  image: hero.value.visual.src,
  localBusiness: {
    name: String(siteConfig.name ?? ''),
    ...(identity.phoneHref ? { telephone: identity.phoneHref.replace(/^tel:/, '') } : {}),
    ...(identity.emailHref ? { email: identity.emailHref.replace(/^mailto:/, '') } : {}),
    ...(identity.areaName ? { areaServed: [identity.areaName] } : {}),
    image: hero.value.visual.src
  }
})
</script>

<template>
  <Hero :hero="hero" />
  <PageBuilder :blocks="blocks" reveal />
</template>
