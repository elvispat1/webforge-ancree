<script setup lang="ts">
/* Accueil MULTIPAGE (mode Multipage, racine /). Une passerelle: le heros, puis
 * un choix d'apercus qui MENENT aux pages dediees (services -> /services, villes
 * -> pages service-ville, temoignages, bandeau d'appel -> /contact). Le contenu
 * profond (a-propos, FAQ, formulaire) vit sur ses pages dediees, joignables par
 * la nav multipage; on ne le duplique pas ici. En-tete en mode multipage (liens
 * de route), via le layout default.
 *
 * Contenu via le payload unique (plugin 01.content, repli fixtures). Les gestes
 * qui pointaient vers une ancre du one-pager (#contact) sont recables vers la
 * vraie route /contact. */
import type { HeroHomeBlock, PageBlock } from '~/types/blocks'

const { t, locale } = useI18n()
const isEn = computed(() => locale.value === 'en')
const localePrefix = computed(() => (isEn.value ? '/en' : ''))

// Blocs retenus pour la passerelle (apercus + conversion), dans l'ordre de rendu.
const GATEWAY_BLOCKS = new Set(['trust-bar', 'services', 'service-cities', 'testimonials', 'cta-band'])

// Recable une ancre du one-pager (#contact) vers la vraie route /contact.
function toContactRoute(href: string | undefined): string | undefined {
  return href === '#contact' ? `${localePrefix.value}/contact` : href
}

// Contenu de l'accueil depuis le payload unique (plugin 01.content), repli fixtures.
const home = useHome()
const identity = useSiteIdentity()
const siteConfig = useSiteConfig()

const hero = computed<HeroHomeBlock>(() => ({
  ...home.value.hero,
  secondaryCta: { ...home.value.hero.secondaryCta, href: `${localePrefix.value}/contact` }
}))

const blocks = computed<PageBlock[]>(() =>
  home.value.blocks
    .filter((b) => GATEWAY_BLOCKS.has(b._type))
    .map((b) => {
      // Bandeau d'appel: geste secondaire vers la vraie route /contact.
      if (b._type === 'cta-band') {
        return { ...b, secondaryCta: b.secondaryCta ? { ...b.secondaryCta, href: toContactRoute(b.secondaryCta.href)! } : undefined }
      }
      // Services (apercu): les cartes ne sont PAS encore des liens individuels.
      // Les pages par nuisible (/services/extermination-<nuisible>) arrivent au
      // prochain temps; les villes, elles, vivent desormais sous le hub /villes.
      // On neutralise les href des items; le CTA « Voir tous les services » ->
      // /services reste le chemin. Cartes informatives, posees.
      if (b._type === 'services') {
        const items = (b as { items?: Array<Record<string, unknown>> }).items ?? []
        return { ...b, items: items.map((it) => ({ ...it, href: undefined })) }
      }
      return b
    })
)

// Accueil (racine): titre/description du CMS (homePage via payload), repli i18n.
// Titre COMPLET (porte deja la marque) -> gabarit neutralise pour ne pas doubler
// le suffixe. Visuel OG du heros. Nom du LocalBusiness = site.name, source UNIQUE
// de la marque (alignee sur Organization, aucun repli divergent). Pas de fil
// d'Ariane (page racine). Suit le patron Minimaliste de l'accueil.
usePageSeo({
  title: home.value.seo.title || t('home.title'),
  description: home.value.seo.description || t('home.lead'),
  titleTemplate: null,
  image: hero.value.visual.src,
  localBusiness: {
    name: String(siteConfig.name ?? ''),
    ...(identity.value.phoneHref ? { telephone: identity.value.phoneHref.replace(/^tel:/, '') } : {}),
    ...(identity.value.emailHref ? { email: identity.value.emailHref.replace(/^mailto:/, '') } : {}),
    ...(identity.value.address ? { address: identity.value.address } : {}),
    ...(identity.value.areaName ? { areaServed: [identity.value.areaName] } : {}),
    image: hero.value.visual.src
  }
})
</script>

<template>
  <Hero :hero="hero" />
  <PageBuilder :blocks="blocks" reveal />
</template>
