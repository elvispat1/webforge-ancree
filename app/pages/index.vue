<script setup lang="ts">
/* Accueil multipage (la marque de ce site), à la racine /. Le héros d'accueil coiffe
 * la page, puis le page-builder rend la composition d'accueil (carrefour orienté
 * conversion: engagements, projets, services, chiffres, histoire, témoignages,
 * blogue, appel à l'action). Layout default (header en mode routes). */
import PageBuilder from '~/components/page-builder/regular/index.vue'

definePageMeta({ layout: 'default' })

// CTAs du héros en mode multipage: le document homePage porte des liens de type
// route (le doc onePager, lui, porte des ancres): plus de réécriture en page.
const hero = useHeroContent()
// Snapshot: `site` ne sert qu'au graphe SEO (head, non réactif). Le Header/Footer,
// eux, lisent useContent('site') comme ref et se mettent à jour in-place.
const site = useContent('site').value
const seo = useFixedPage('home').seo

// Accueil: gabarit de titre neutralisé (le doc porte le titre complet de
// marque, replis 12.10 faits au transform), visuel OG du héros, et identité
// LocalBusiness complète du graphe (NAP + zone desservie).
usePageSeo({
  ...seo,
  titleTemplate: null,
  image: hero.value.visual.src,
  localBusiness: {
    name: site.brand.name,
    telephone: site.contact.phoneE164,
    email: site.contact.email,
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

const blocks = useHomeBlocks()
</script>

<template>
  <Hero :hero="hero" />
  <PageBuilder :blocks="blocks" reveal />
</template>
