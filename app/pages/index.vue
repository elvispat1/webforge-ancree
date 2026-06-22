<script setup lang="ts">
import PageBuilder from '~/components/page-builder/regular/index.vue'
/* Accueil MULTIPAGE (mode Multipage, racine /). Une passerelle: le heros, puis
 * un choix d'apercus qui MENENT aux pages dediees (services -> /services, villes
 * -> pages service-ville, temoignages, bandeau d'appel -> /contact). Le contenu
 * profond (a-propos, FAQ, formulaire) vit sur ses pages dediees, joignables par
 * la nav multipage; on ne le duplique pas ici. En-tete en mode multipage (liens
 * de route), via le layout default.
 *
 * V2 (Sanity, fail-fast): heros et blocs viennent du payload unique (plugin
 * 01.content) via useHeroContent/useHomeBlocks; resolveBlocks a deja resolu les
 * items contre les collections. La page ne fait que (a) filtrer la passerelle,
 * (b) recabler les gestes qui pointaient vers une ancre du one-pager (#contact)
 * vers la vraie route /contact. */
import type { HeroHomeBlock, PageBlock } from '~/types/blocks'

const { locale } = useI18n()
const isEn = computed(() => locale.value === 'en')
const localePrefix = computed(() => (isEn.value ? '/en' : ''))

// Blocs retenus pour la passerelle (apercus + conversion), dans l'ordre de rendu.
const GATEWAY_BLOCKS = new Set(['trust-bar', 'services', 'service-cities', 'testimonials', 'cta-band'])

// Recable une ancre du one-pager (#contact) vers la vraie route /contact.
function toContactRoute(href: string | undefined): string | undefined {
  return href === '#contact' ? `${localePrefix.value}/contact` : href
}

// CTA du heros en mode multipage: le document homePage porte deja des liens de
// type route. On garde toutefois le recablage du geste secondaire vers /contact
// (la passerelle envoie au formulaire dedie, pas a une ancre).
const heroContent = useHeroContent('home')
const hero = computed<HeroHomeBlock>(() => ({
  ...heroContent.value,
  secondaryCta: { ...heroContent.value.secondaryCta, href: `${localePrefix.value}/contact` }
}))

// Snapshot: `site` ne sert qu'au graphe SEO (head, non reactif). Le Header/Footer
// lisent useContent('site') comme ref et se mettent a jour in-place en preview.
const site = useContent('site').value
const seo = useFixedPage('home').seo

const homeBlocks = useHomeBlocks()
const blocks = computed<PageBlock[]>(() =>
  homeBlocks.value
    .filter((b) => GATEWAY_BLOCKS.has(b._type))
    .map((b) => {
      // Bandeau d'appel: geste secondaire vers la vraie route /contact.
      if (b._type === 'cta-band') {
        return { ...b, secondaryCta: b.secondaryCta ? { ...b.secondaryCta, href: toContactRoute(b.secondaryCta.href)! } : undefined }
      }
      // Services (apercu): les cartes ne sont PAS des liens individuels sur la
      // passerelle. Le CTA « Voir tous les services » -> /services reste le
      // chemin; on neutralise les href des items. Cartes informatives, posees.
      if (b._type === 'services') {
        return { ...b, items: b.items.map((it) => ({ ...it, href: undefined })) }
      }
      return b
    })
)

// Accueil (racine): titre/description du CMS (homePage via payload, replis deja
// faits au transform). Titre COMPLET (porte deja la marque) -> gabarit
// neutralise pour ne pas doubler le suffixe. Visuel OG du heros. Identite
// LocalBusiness complete du graphe (NAP + zone desservie), source UNIQUE de la
// marque. Pas de fil d'Ariane (page racine). Suit le patron Minimaliste.
usePageSeo({
  ...seo,
  titleTemplate: null,
  image: hero.value.visual.src,
  localBusiness: {
    name: site.brand.name,
    telephone: site.contact.phoneE164,
    email: site.contact.email,
    // Cles Schema.org reconstruites au point de consommation depuis la NAP
    // imbriquee (cityProv sert l'affichage; city/region/country/postal sont les
    // champs structures du PostalAddress). Voir transformSiteSettings.
    address: {
      streetAddress: site.contact.address.line1,
      addressLocality: site.contact.address.city,
      addressRegion: site.contact.address.region,
      postalCode: site.contact.address.postal,
      addressCountry: site.contact.address.country
    },
    areaServed: site.contact.areaServed,
    image: hero.value.visual.src,
    foundingDate: String(site.brand.foundedYear)
  }
})
</script>

<template>
  <Hero :hero="hero" />
  <PageBuilder :blocks="blocks" reveal />
</template>
